import Signal from "./Signal";
import Candle from "./Candle";
import Logger from '../service/Logger';
import TradingClient from "./TradingClient";
import { Asset } from "./interfaces/SignalData";
import { Timebox } from "./interfaces/Timebox";

export type Operation = {
    candleDifference: CandleDifference,
    asset: Asset
}

export type CandleDifference = {
    candleBefore?: Candle,
    candleAfter?: Candle
}

export type OperationSummary = {
    operations: Operation[]
    telegramMessageId: number,
    telegramChannelId: number,
    gale: boolean
}

export type Result = {
    operation: Operation,
    result: string
}

export type OperationResult = {
    results: Result[],
    telegramMessageId: number,
    telegramChannelId: number,
    gale: boolean
}

export default class SignalRunner {
    private _tradingClient: TradingClient;
    private delay;

    constructor(tradingClient: TradingClient, delayFunction?: (n) => void) {
        this._tradingClient = tradingClient;
        delayFunction ?
            this.delay = delayFunction :
            this.delay = (n) => {
                n = n || 2000;
                return new Promise(done => {
                  setTimeout(() => {
                    done();
                  }, n);
                });
            };
    }

    async run(signal: Signal): Promise<OperationSummary> {
        Logger.info(`Running signal:`, signal);
        const assetsOperations: Promise<Operation>[] = [];
        signal.getAssetList().forEach(asset => {
            assetsOperations.push(this.runSignalAsset(asset, signal.getExpiration()))
        })
        const operations = await Promise.all(assetsOperations)
        Logger.info(`Operation summary:`, {operations, telegramChannelId: signal.getTelegramChannelId(), telegramMessageId: signal.getTelegramMessageId(), gale: signal.hasGale()});
        return {operations, telegramChannelId: signal.getTelegramChannelId(), telegramMessageId: signal.getTelegramMessageId(), gale: signal.hasGale()}
    };

    private async runSignalAsset(asset: Asset, expiration: Timebox): Promise<Operation> {
        try {
            const isAssetAvailable = await this._tradingClient.checkAssetAvailability(asset.pair);
            if (isAssetAvailable) {
                Logger.info(`Running asset:`, asset);
                const candleBefore = await this._tradingClient.getCurrentCandleFor(asset.pair, expiration);
                Logger.info(`Waiting ${expiration/60} minute(s) to get last signal again`);
                await this.delay(expiration * 1000);
                const candleAfter = await this._tradingClient.getLastCandleAgainFor(asset.pair, expiration);
                Logger.info(`Candle difference:`, {candleBefore, candleAfter});
                return { candleDifference: { candleAfter, candleBefore }, asset };
            } else {
                const err = new Error(`Asset ${asset.pair} not available at the moment`);
                Logger.error(`Asset ${asset.pair} not available at the moment`, err);
                return {candleDifference: { candleAfter: undefined, candleBefore: undefined }, asset}
            }
        } catch (err) {
            Logger.error(`Error while running signal asset ${JSON.stringify(asset)}`, err);
            throw new Error(`Error while running signal asset ${JSON.stringify(asset)}`)
        }
    }

    closeTradingClientConnection() {
        this._tradingClient.closeConnection();
    }

    checkWin(operationSummary: OperationSummary): OperationResult {
        Logger.info(`Checking win for operation summary:`, operationSummary);
        const results = operationSummary.operations.map(operation => this.getResult(operation))
        return { results, telegramChannelId: operationSummary.telegramChannelId, telegramMessageId: operationSummary.telegramMessageId, gale: operationSummary.gale }
    }

    private getResult(operation: Operation): Result {
        if (operation.candleDifference.candleBefore && operation.candleDifference.candleAfter) {
            if (operation.asset.action.toLowerCase() === 'PUT'.toLowerCase()) {
                if (operation.candleDifference.candleBefore.getOpenValue() > operation.candleDifference.candleAfter.getCloseValue()) {
                    return { operation, result: 'WIN' };
                }
                if (operation.candleDifference.candleBefore.getOpenValue() < operation.candleDifference.candleAfter.getCloseValue()) {
                    return { operation, result: 'LOSS' };
                }
                if (operation.candleDifference.candleBefore.getOpenValue() === operation.candleDifference.candleAfter.getCloseValue()) {
                    return { operation, result: 'DOJI' };
                }
            }
            if (operation.asset.action.toLowerCase() === 'CALL'.toLowerCase()) {
                if (operation.candleDifference.candleBefore.getOpenValue() < operation.candleDifference.candleAfter.getCloseValue()) {
                    return { operation, result: 'WIN' };
                }
                if (operation.candleDifference.candleBefore.getOpenValue() > operation.candleDifference.candleAfter.getCloseValue()) {
                    return { operation, result: 'LOSS' };
                }
                if (operation.candleDifference.candleBefore.getOpenValue() === operation.candleDifference.candleAfter.getCloseValue()) {
                    return { operation, result: 'DOJI' };
                }
            }
        } else {
            return { operation, result: '' }
        }
    }


}