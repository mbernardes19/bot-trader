import DerivClient, { CandlesParam } from '../src/model/DerivClient';
import { Candle } from '../src/model/interfaces/Candle';
import { getDerivServerResponse, getCandle } from '../__mocks__/CandleMock';

jest.mock('@deriv/deriv-api', () => (
    jest.fn().mockImplementation(() => {
        return {candles: () => getDerivServerResponse()}
    })
));

jest.mock('ws', () => (
    jest.fn().mockImplementation(() => {
        return {readyState: 1, close: () => true}
    })
));

let derivClient: DerivClient;

beforeEach(() => derivClient = new DerivClient())

describe('DerivClient', () => {
    it('should get one candle', async () => {
        // Given
        const candleParam: CandlesParam = {
            granularity: 60,
            symbol: 'frxEURUSD',
            range: { start: new Date(), end: new Date(), count: 1}
        }

        // When
        const candles = await derivClient.getCandles(candleParam);

        // Then
        expect(candles[0]).toStrictEqual<Candle>(getCandle())
        expect(candles).toHaveLength(1);
    })

    it('should get current candle for EURUSD', async () => {
        // Given

        // When
        const currentCandle = await derivClient.getCurrentCandleFor('EURUSD', 300);

        // Then
        expect(currentCandle).toStrictEqual<Candle>(getCandle())
    })
})