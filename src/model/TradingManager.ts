import SignalRunner, { OperationResult, OperationSummary } from "./SignalRunner";
import DerivClient from "./DerivClient";
import Signal from "./Signal";
import Logger from "../service/Logger";
import DefaultStrategy from "./DefaultStrategy";
import { SignalData, Asset } from "./interfaces/SignalData";

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
        if (operationResult.type === 'extraAnalysis') {
            const winResults = operationResult.results.filter(r => r.result === 'WIN')
            const lossResults = operationResult.results.filter(r => r.result === 'LOSS' || r.result === 'DOJI')
            if (lossResults.length === 0) {
                this._signalRunner.closeTradingClientConnection();
                return operationResult;
            }
            const assetList: Asset[] = lossResults.map(res => res.operation.asset)
            const signalData: SignalData = {
                assetList,
                telegramChannelId: signal.getTelegramChannelId(),
                telegramMessageId: signal.getTelegramMessageId(),
                time: signal.getTime(),
                type: signal.getType(),
                expiration: 5,
                gale: signal.hasGale()
            }
            const newSignal = new Signal(signalData);
            const newOperationResult = await this.runGale(operationResult, newSignal)
            return {...newOperationResult, results:[...winResults, ...newOperationResult.results]}
        }
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
        return this._signalRunner.checkWin(operationSummary, 1)
    }
}