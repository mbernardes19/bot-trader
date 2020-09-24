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
            const candleBefore = await this._derivClient.getCurrentCandleFor(signal.getAsset(), signal.getExpiration());
            await this.delay(signal.getExpiration() * 1000);
            const candleAfter = await this._derivClient.getLastCandleAgainFor(signal.getAsset(), signal.getExpiration());
            return {candleBefore, candleAfter, signalAction: signal.getAction()};
        } catch (err) {
            Logger.error(`Error while running signal ${signal}`, err);
            throw new Error(`Error while running signal ${signal}`)
        }
    };

    checkWin(operationSummary: OperationSummary): OperationResult {
        const {candleBefore, candleAfter, signalAction} = operationSummary;

        if (signalAction === 'PUT') {
            return candleBefore.getOpenValue() > candleAfter.getCloseValue() ?
                { operationSummary, result: 'WIN' } : { operationSummary, result: 'LOSS' };
        }
        if (signalAction === 'CALL') {
            return candleBefore.getOpenValue() < candleAfter.getCloseValue() ?
                { operationSummary, result: 'WIN' } : { operationSummary, result: 'LOSS' };
        }
    }
}