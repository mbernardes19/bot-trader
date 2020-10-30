import Signal from "./Signal";
import Candle from "./Candle";
import Logger from '../service/Logger';
import TradingClient from "./TradingClient";
import { Asset } from "./interfaces/SignalData";
import { Timebox } from "./interfaces/Timebox";
import TradingStrategy from "./TradingStrategy";

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
    private _strategy: TradingStrategy;
    private delay;

    constructor(tradingClient: TradingClient, strategy?: TradingStrategy, delayFunction?: (n) => void) {
        this._tradingClient = tradingClient;
        this._strategy = strategy;
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

    async validate(signal: Signal): Promise<Signal> {
        return await this._strategy.validate(this._tradingClient, signal)
    }

    async run(signal: Signal): Promise<OperationSummary> {
        Logger.info(`Running signal:`, signal);
        const assetsOperations: Promise<Operation>[] = [];
        signal.getAssetList().forEach(asset => {
            assetsOperations.push(this.runSignalAsset(asset, signal.getExpiration()))
        })
        const operations = await Promise.all(assetsOperations)
        Logger.info(`Operation summary:`, {operations, telegramChannelId: signal.getTelegramChannelId(), telegramMessageId: signal.getTelegramMessageId(), gale: signal.hasGale()});
        console.log('OPERATIONS RETURNED FROM RUN METHOD')
        operations.map(operation => Logger.info(operation))
        return {operations, telegramChannelId: signal.getTelegramChannelId(), telegramMessageId: signal.getTelegramMessageId(), gale: signal.hasGale()}
    };

    private async runSignalAsset(asset: Asset, expiration: Timebox): Promise<Operation> {
        try {
            const isAssetAvailable = await this._tradingClient.checkAssetAvailability(asset.pair);
            if (isAssetAvailable) {
                if (!asset.inStrategy) {
                    return {candleDifference: { candleAfter: undefined, candleBefore: undefined }, asset}
                }
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
        operationSummary.operations.map(operation => Logger.info(operation.asset))
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
            if (!operation.asset.inStrategy) {
                return { operation, result: 'NOT IN STRATEGY'}
            }
            return { operation, result: '' }
        }
    }


}