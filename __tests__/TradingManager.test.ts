import DerivClient from '../src/model/DerivClient';
import Candle from '../src/model/Candle';
import SignalRunner, { OperationResult } from '../src/model/SignalRunner';
import { Timebox } from '../src/model/interfaces/Timebox';
import TradingManager from '../src/model/TradingManager';
import Signal from '../src/model/Signal';
import { Action } from '../src/model/interfaces/SignalData';

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
        const signal: Signal = new Signal({ time: '10:15', expiration: 5, assetList: [{action: Action.PUT, pair: 'EURUSD'}], telegramMessageId: 201, telegramChannelId: -100, gale: false });
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            results: [
                {
                    operation: {
                        candleDifference: {
                            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                            candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5),
                        },
                        asset: {
                            action: Action.PUT,
                            pair: 'EURUSD'
                        }
                    },
                    result: 'LOSS'
                }
            ],
            telegramMessageId: 201,
            telegramChannelId: -100,
            gale: false
        }))
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            results: [
                {
                    operation: {
                        candleDifference: {
                            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                            candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5)
                        },
                        asset: {
                            pair: 'EURUSD',
                            action: Action.PUT
                        }
                    },
                    result: 'WIN'
                }
            ],
            telegramMessageId: 201,
            telegramChannelId: -100,
            gale: false
        }))

        // When
        const operationResult = await tradingManager.runSignal(signal)

        // Then
        expect(operationResult.results[0].result).toBe('LOSS')
    })

    it('should run signal with gale', async () => {
        // Given
        const signal: Signal = new Signal({time: '10:15', expiration: 5, assetList: [{action: Action.PUT, pair: 'EURUSD'}], telegramMessageId: 201, telegramChannelId: -100, gale: true });
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            results: [
                {
                    operation: {
                        candleDifference: {
                            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                            candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5)
                        },
                        asset: {
                            action: Action.PUT,
                            pair: 'EURUSD'
                        }
                    },
                    result: 'LOSS'
                }
            ],
            telegramMessageId: 201,
            telegramChannelId: -100,
            gale: true
        }))
        mockedSignalRunner.checkWin.mockImplementationOnce((): OperationResult => ({
            results: [
                {
                    operation: {
                        candleDifference: {
                            candleBefore: new Candle({ open: 123, close: 432, high: 545, low: 454, epoch: 252}, Timebox.M5),
                            candleAfter: new Candle({ open: 123, close: 122.9, high: 545, low: 454, epoch: 252}, Timebox.M5)
                        },
                        asset: {
                            pair: 'EURUSD',
                            action: Action.PUT
                        }
                    },
                    result: 'WIN'
                }
            ],
            telegramMessageId: 201,
            telegramChannelId: -100,
            gale: true
        }))

        // When
        const operationResult = await tradingManager.runSignal(signal)

        // Then
        expect(operationResult.results[0].result).toBe('WIN')
    })

});