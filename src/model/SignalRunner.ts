import Signal from "./Signal";
import Candle from "./Candle";
import Logger from '../service/Logger';
import TradingClient from "./TradingClient";

export type OperationSummary = {
    candleBefore: Candle,
    candleAfter: Candle,
    signalAction: string,
    telegramMessageId: number,
}

export type OperationResult = {
    operationSummary: OperationSummary,
    result: string,
    telegramMessageId: number
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
        try {
            const isAssetAvailable = await this._tradingClient.checkAssetAvailability(signal.getAsset());
            if (isAssetAvailable) {
                Logger.info(`Running signal:`, signal);
                const candleBefore = await this._tradingClient.getCurrentCandleFor(signal.getAsset(), signal.getExpiration());
                Logger.info(`Waiting ${signal.getExpiration()/60} minute(s) to get last signal again`);
                await this.delay(signal.getExpiration() * 1000);
                const candleAfter = await this._tradingClient.getLastCandleAgainFor(signal.getAsset(), signal.getExpiration());
                Logger.info(`Operation summary:`, {candleBefore, candleAfter, signalAction: signal.getAction()});
                return {candleBefore, candleAfter, signalAction: signal.getAction(), telegramMessageId: signal.getTelegramMessageId()};
            } else {
                const err = new Error(`Asset ${signal.getAsset()} not available at the moment`);
                Logger.error(`Asset ${signal.getAsset()} not available at the moment`, err);
                throw err;
            }
        } catch (err) {
            Logger.error(`Error while running signal ${JSON.stringify(signal)}`, err);
            throw new Error(`Error while running signal ${JSON.stringify(signal)}`)
        }
    };

    closeTradingClientConnection() {
        this._tradingClient.closeConnection();
    }

    checkWin(operationSummary: OperationSummary): OperationResult {
        Logger.info(`Checking win for operation summary:`, operationSummary);
        const {candleBefore, candleAfter, signalAction} = operationSummary;

        if (signalAction.toLowerCase() === 'PUT'.toLowerCase()) {
            if (candleBefore.getOpenValue() > candleAfter.getCloseValue()) {
                return { operationSummary, result: 'WIN', telegramMessageId: operationSummary.telegramMessageId };
            }
            if (candleBefore.getOpenValue() < candleAfter.getCloseValue()) {
                return { operationSummary, result: 'LOSS', telegramMessageId: operationSummary.telegramMessageId };
            }
            if (candleBefore.getOpenValue() === candleAfter.getCloseValue()) {
                return { operationSummary, result: 'DOJI', telegramMessageId: operationSummary.telegramMessageId};
            }
        }
        if (signalAction.toLowerCase() === 'CALL'.toLowerCase()) {
            if (candleBefore.getOpenValue() < candleAfter.getCloseValue()) {
                return { operationSummary, result: 'WIN', telegramMessageId: operationSummary.telegramMessageId };
            }
            if (candleBefore.getOpenValue() > candleAfter.getCloseValue()) {
                return { operationSummary, result: 'LOSS', telegramMessageId: operationSummary.telegramMessageId };
            }
            if (candleBefore.getOpenValue() === candleAfter.getCloseValue()) {
                return { operationSummary, result: 'DOJI', telegramMessageId: operationSummary.telegramMessageId };
            }
        }
    }
}