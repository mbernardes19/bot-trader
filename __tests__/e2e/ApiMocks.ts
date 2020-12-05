import { OperationResult } from "../../src/model/SignalRunner";
import Candle from "../../src/model/Candle";
import { Timebox } from "../../src/model/interfaces/Timebox";
import { Action, SignalData } from "../../src/model/interfaces/SignalData";

export const signalDataMock: SignalData[] = [
    {
        assetList: [{pair: 'EURUSD', action: Action.PUT, inStrategy: true}],
        time: '10:20',
        expiration: 5,
        telegramMessageId: 123,
        telegramChannelId: 1234,
        gale: true,
        type: 'withGale'
    },
    {
        assetList: [
            {pair: 'EURUSD', action: Action.PUT, inStrategy: true},
            {pair: 'USDJPY', action: Action.CALL, inStrategy: true}
        ],
        time: '10:20',
        expiration: 5,
        telegramMessageId: 123,
        telegramChannelId: 1234,
        gale: true,
        type: 'extraAnalysis'
    }
]

export const operationResultsMock: OperationResult[] = [
    {
        results: [
            {
                result: 'win',
                operation: {
                    candleDifference: {
                        candleAfter: new Candle({close: 12, open: 10, high: 20, low: 12, epoch: 123}, Timebox.M5),
                        candleBefore: new Candle({close: 12, open: 10, high: 20, low: 12, epoch: 123}, Timebox.M5)
                    },
                    asset: {pair: 'EURUSD', action: Action.PUT},
                }
            }
        ],
        telegramChannelId: 123,
        telegramMessageId: 1234,
        type: 'withGale',
        gale: true
    },
    {
        results: [
            {
                result: 'win',
                operation: {
                    candleDifference: {
                        candleAfter: new Candle({close: 12, open: 10, high: 20, low: 12, epoch: 123}, Timebox.M5),
                        candleBefore: new Candle({close: 12, open: 10, high: 20, low: 12, epoch: 123}, Timebox.M5)
                    },
                    asset: {pair: 'EURUSD', action: Action.PUT},
                }
            },
            {
                result: 'loss',
                operation: {
                    candleDifference: {
                        candleAfter: new Candle({close: 12, open: 10, high: 20, low: 12, epoch: 123}, Timebox.M5),
                        candleBefore: new Candle({close: 12, open: 10, high: 20, low: 12, epoch: 123}, Timebox.M5)
                    },
                    asset: {pair: 'USDJPY', action: Action.CALL},
                }
            }
        ],
        telegramChannelId: 123,
        telegramMessageId: 1234,
        type: 'extraAnalysis',
        gale: true
    }
]