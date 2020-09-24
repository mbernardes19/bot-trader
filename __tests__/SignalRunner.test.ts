import DerivClient from '../src/model/DerivClient';
import Candle from '../src/model/Candle';
import SignalRunner, { OperationSummary } from '../src/service/SignalRunner';
import { Timebox } from '../src/model/interfaces/Timebox';
import Signal from '../src/model/Signal';

jest.mock('../src/model/DerivClient');

let signalRunner: SignalRunner;
const mockedDerivClient = new DerivClient() as jest.Mocked<DerivClient>
const mockedDelayFunction = (n) => {setTimeout(() => jest.fn(), n)}

jest.useFakeTimers();

beforeEach(() => {
    signalRunner = new SignalRunner(mockedDerivClient, mockedDelayFunction);
    jest.resetAllMocks();
})

describe('SignalRunner', () => {
    it('should return operation result with WIN for PUT operation', () => {
        // Given
        const operationSummary: OperationSummary = {
            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
            candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
            signalAction: 'PUT'
        }

        // When
        const operationResult = signalRunner.checkWin(operationSummary)

        // Then
        expect(operationResult.result).toBe('WIN')
    })

    it('should return operation result with WIN for CALL operation', () => {
        // Given
        const operationSummary: OperationSummary = {
            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
            candleAfter: new Candle({ open: 123, close: 123.5, high: 545, low: 454, epoch: 252}, Timebox.M5),
            signalAction: 'CALL'
        }

        // When
        const operationResult = signalRunner.checkWin(operationSummary)

        // Then
        expect(operationResult.result).toBe('WIN')
    })

    it('should return operation result with LOSS for PUT operation', () => {
        // Given
        const operationSummary: OperationSummary = {
            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
            candleAfter: new Candle({ open: 123, close: 123.5, high: 545, low: 454, epoch: 252}, Timebox.M5),
            signalAction: 'PUT'
        }

        // When
        const operationResult = signalRunner.checkWin(operationSummary)

        // Then
        expect(operationResult.result).toBe('LOSS')
    })

    it('should return operation result with LOSS for CALL operation', () => {
        // Given
        const operationSummary: OperationSummary = {
            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
            candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
            signalAction: 'CALL'
        }

        // When
        const operationResult = signalRunner.checkWin(operationSummary)

        // Then
        expect(operationResult.result).toBe('LOSS')
    })

    it('should wait for signals expiration time (1 minute) to get candle again', async () => {
        // Given
        const signal = new Signal({time: '10:15', asset:'EURUSD', action: 'PUT', expiration: 1});

        // When
        await signalRunner.run(signal)

        // Then
        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);
        expect(mockedDerivClient.getLastCandleAgainFor).toHaveBeenCalled();
    })

    it('should wait for signals expiration time (5 minutes) to get candle again', async () => {
        // Given
        const signal = new Signal({time: '10:15', asset:'EURUSD', action: 'PUT', expiration: 5});

        // When
        await signalRunner.run(signal)

        // Then
        expect(setTimeout).toHaveBeenCalled();
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300000);
        expect(mockedDerivClient.getLastCandleAgainFor).toHaveBeenCalled();
    })
})