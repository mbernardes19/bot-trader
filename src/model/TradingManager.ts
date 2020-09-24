import SignalRunner, { OperationResult, OperationSummary } from "./SignalRunner";
import DerivClient from "./DerivClient";
import Signal from "./Signal";

export default class TradingManager {
    private _signalRunner: SignalRunner;

    constructor(signalRunner?: SignalRunner) {
        signalRunner ?
            this._signalRunner = signalRunner :
            this._signalRunner = new SignalRunner(new DerivClient());
    }

    async runSignal(signal: Signal): Promise<OperationResult> {
        const operationSummary = await this._signalRunner.run(signal);
        const operationResult = this._signalRunner.checkWin(operationSummary);
        if (process.env.GALE === 'true') {
            return await this.runGale(operationResult, signal);
        }
        return operationResult;
    }

    private async runGale(operationResult: OperationResult, signal: Signal): Promise<OperationResult> {
        if (operationResult.result === 'LOSS') {
            const operationSummaryGale = await this._signalRunner.run(signal);
            const operationResultGale = this.checkWinForOperation(operationSummaryGale);
            return operationResultGale;
        }
    }

    checkWinForOperation(operationSummary: OperationSummary): OperationResult {
        return this._signalRunner.checkWin(operationSummary)
    }
}