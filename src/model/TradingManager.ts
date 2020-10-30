import SignalRunner, { OperationResult, OperationSummary } from "./SignalRunner";
import DerivClient from "./DerivClient";
import Signal from "./Signal";
import Logger from "../service/Logger";
import DefaultStrategy from "./DefaultStrategy";

export default class TradingManager {
    private _signalRunner: SignalRunner;
    private _try: number;

    constructor(signalRunner?: SignalRunner) {
        signalRunner ?
            this._signalRunner = signalRunner :
            this._signalRunner = new SignalRunner(new DerivClient(), new DefaultStrategy());
        this._try = 0;
    }

    async validateSignal(signal: Signal) {
        return await this._signalRunner.validate(signal);
    }

    async runSignal(signal: Signal): Promise<OperationResult> {
        this._try += 1;
        const operationSummary = await this._signalRunner.run(signal);
        const operationResult = this._signalRunner.checkWin(operationSummary);
        if ((operationResult.results[0].result === 'LOSS' || operationResult.results[0].result === 'DOJI') && this._try < 2 && signal.hasGale()) {
            Logger.info(`Running gale`)
            return await this.runGale(operationResult, signal);
        }
        if (this._try >= 2) {
            this._try = 0;
        }
        this._signalRunner.closeTradingClientConnection();
        return operationResult;
    }

    private async runGale(operationResult: OperationResult, signal: Signal): Promise<OperationResult> {
        const operationSummaryGale = await this._signalRunner.run(signal);
        const operationResultGale = this.checkWinForOperation(operationSummaryGale);
        this._signalRunner.closeTradingClientConnection();
        return operationResultGale;
    }

    checkWinForOperation(operationSummary: OperationSummary): OperationResult {
        return this._signalRunner.checkWin(operationSummary)
    }
}