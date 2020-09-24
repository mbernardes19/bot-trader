import Signal from "../model/Signal";
import DerivClient from "../model/DerivClient";
import Candle from "../model/Candle";
import Logger from './Logger';

export type OperationSummary = {
    candleBefore: Candle,
    candleAfter: Candle,
    signalAction: string
}

export type OperationResult = {
    operationSummary: OperationSummary,
    result: string
}

export default class SignalRunner {
    private _derivClient: DerivClient;
    private delay;

    constructor(derivClient: DerivClient, delayFunction?: (n) => void) {
        this._derivClient = derivClient;
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
            Logger.info(`Running signal:`, signal);
            const candleBefore = await this._derivClient.getCurrentCandleFor(signal.getAsset(), signal.getExpiration());
            Logger.info(`Waiting ${signal.getExpiration()/60} minute(s) to get last signal again`);
            await this.delay(signal.getExpiration() * 1000);
            const candleAfter = await this._derivClient.getLastCandleAgainFor(signal.getAsset(), signal.getExpiration());
            Logger.info(`Operation summary:`, {candleBefore, candleAfter, signalAction: signal.getAction()});
            return {candleBefore, candleAfter, signalAction: signal.getAction()};
        } catch (err) {
            Logger.error(`Error while running signal ${JSON.stringify(signal)}`, err);
            throw new Error(`Error while running signal ${JSON.stringify(signal)}`)
        }
    };

    checkWin(operationSummary: OperationSummary): OperationResult {
        Logger.info(`Checking win for operation summary:`, operationSummary);
        const {candleBefore, candleAfter, signalAction} = operationSummary;

        if (signalAction === 'PUT') {
            if (candleBefore.getOpenValue() > candleAfter.getCloseValue()) {
                return { operationSummary, result: 'WIN' };
            }
            if (candleBefore.getOpenValue() < candleAfter.getCloseValue()) {
                return { operationSummary, result: 'LOSS' };
            }
            if (candleBefore.getOpenValue() === candleAfter.getCloseValue()) {
                return { operationSummary, result: 'DOJI' };
            }
        }
        if (signalAction === 'CALL') {
            if (candleBefore.getOpenValue() > candleAfter.getCloseValue()) {
                return { operationSummary, result: 'WIN' };
            }
            if (candleBefore.getOpenValue() < candleAfter.getCloseValue()) {
                return { operationSummary, result: 'LOSS' };
            }
            if (candleBefore.getOpenValue() === candleAfter.getCloseValue()) {
                return { operationSummary, result: 'DOJI' };
            }
        }
    }
}