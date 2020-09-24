import Signal from "../model/Signal";
import DerivClient from "../model/DerivClient";
import Candle from "../model/Candle";

export type OperationSummary = {
    firstCandle: Candle,
    secondCandle: Candle,
    signalAction: string
}

export type OperationResult = {
    operationSummary: OperationSummary,
    result: string
}

export default class SignalRunner {
    private _derivClient: DerivClient;

    constructor(derivClient: DerivClient) {
        this._derivClient = derivClient;
    }

    async run(signal: Signal): Promise<OperationSummary> {
        const firstCandle = await this._derivClient.getCurrentCandleFor(signal.getAsset(), signal.getExpiration());
        await this.delay(signal.getExpiration() * 1000);
        const secondCandle = await this._derivClient.getLastCandleAgainFor(signal.getAsset(), signal.getExpiration());
        return {firstCandle, secondCandle, signalAction: signal.getAction()};
    };

    private delay(n) {
        n = n || 2000;
        return new Promise(done => {
          setTimeout(() => {
            done();
          }, n);
        });
      }

    checkWin(operationSummary: OperationSummary): OperationResult {
        const {firstCandle, secondCandle, signalAction} = operationSummary;

        if (signalAction === 'PUT') {
            return firstCandle.getOpenValue() > secondCandle.getCloseValue() ?
                { operationSummary, result: 'WIN' } : { operationSummary, result: 'LOSS' };
        }
        if (signalAction === 'CALL') {
            return firstCandle.getOpenValue() < secondCandle.getCloseValue() ?
                { operationSummary, result: 'WIN' } : { operationSummary, result: 'LOSS' };
        }
    }
}