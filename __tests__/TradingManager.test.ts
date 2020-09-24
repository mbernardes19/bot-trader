import DerivClient from '../src/model/DerivClient';
import Candle from '../src/model/Candle';
import SignalRunner, { OperationSummary, OperationResult } from '../src/model/SignalRunner';
import { Timebox } from '../src/model/interfaces/Timebox';
import TradingManager from '../src/model/TradingManager';
import Signal from '../src/model/Signal';

jest.mock('../src/model/SignalRunner');

let tradingManager: TradingManager;
const mockedDerivClient = new DerivClient() as jest.Mocked<DerivClient>;
const mockedDelayFunction = (n) => {setTimeout(() => jest.fn(), n)}
const mockedSignalRunner = new SignalRunner(mockedDerivClient, mockedDelayFunction) as jest.Mocked<SignalRunner>

jest.useFakeTimers();

beforeEach(() => {
    tradingManager = new TradingManager(mockedSignalRunner);
    jest.resetAllMocks();
})

describe('TradingManager', () => {
    it('should run signal without gale', async () => {
        // Given
        process.env.GALE = undefined;
        const signal: Signal = new Signal({time: '10:15', expiration: 5, action: 'PUT', asset: 'EURUSD'});
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            operationSummary: {
                candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
                signalAction: 'PUT'
            },
            result: 'LOSS'
        }))
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            operationSummary: {
                candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
                signalAction: 'PUT'
            },
            result: 'WIN'
        }))

        // When
        const operationResult = await tradingManager.runSignal(signal)

        // Then
        expect(operationResult.result).toBe('LOSS')
    })

    it('should run signal without gale', async () => {
        // Given
        process.env.GALE = 'true';
        const signal: Signal = new Signal({time: '10:15', expiration: 5, action: 'PUT', asset: 'EURUSD'});
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            operationSummary: {
                candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
                signalAction: 'PUT'
            },
            result: 'LOSS'
        }))
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            operationSummary: {
                candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
                signalAction: 'PUT'
            },
            result: 'WIN'
        }))

        // When
        const operationResult = await tradingManager.runSignal(signal)

        // Then
        expect(operationResult.result).toBe('WIN')
    })

});