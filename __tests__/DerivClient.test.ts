import DerivClient, { CandlesParam } from '../src/model/DerivClient';
import Candle from '../src/model/Candle';
import { getDerivServerResponse } from '../__mocks__/CandleMock';
import DerivAPI from '@deriv/deriv-api';
import WebSocket from 'ws';

jest.mock('@deriv/deriv-api');
jest.mock('ws');

let derivClient: DerivClient;
const mockedWebSocket = new WebSocket() as jest.MockedClass<WebSocket>
const mockedDerivAPI = new DerivAPI() as jest.MockedClass<DerivAPI>

beforeEach(() => {
    derivClient = new DerivClient(mockedWebSocket, mockedDerivAPI);
    jest.resetAllMocks();
})

describe('DerivClient', () => {
    it('should get one candle', async () => {
        mockedDerivAPI.candles.mockImplementation(() => getDerivServerResponse(1))

        // Given
        const candleParam: CandlesParam = {
            granularity: 60,
            symbol: 'frxEURUSD',
            range: { start: new Date(), end: new Date(), count: 1}
        }

        // When
        const candles = await derivClient.getCandles(candleParam);

        // Then
        expect(candles[0]).toBeInstanceOf(Candle);
        expect(candles).toHaveLength(1);
    })

    it('should get two candles', async () => {
        mockedDerivAPI.candles.mockImplementation(() => getDerivServerResponse(2))

        // Given
        const candleParam: CandlesParam = {
            granularity: 60,
            symbol: 'frxEURUSD',
            range: { start: new Date(), end: new Date(), count: 2}
        }

        // When
        const candles = await derivClient.getCandles(candleParam);

        // Then
        expect(candles[0]).toBeInstanceOf(Candle);
        expect(candles).toHaveLength(2);
    })

    it('connection should keep existing after getting candle', async () => {
        mockedDerivAPI.candles.mockImplementation(() => getDerivServerResponse(1))

        // Given
        const candleParam: CandlesParam = {
            granularity: 60,
            symbol: 'frxEURUSD',
            range: { start: new Date(), end: new Date(), count: 1}
        }

        // When
        const candles = await derivClient.getCandles(candleParam);

        // Then
        expect(derivClient.getConnectionStatus()).toBe('active');
    })

    it('should get current candle for EURUSD', async () => {
        mockedDerivAPI.candles.mockImplementation(() => getDerivServerResponse(1))
        // Given

        // When
        const currentCandle = await derivClient.getCurrentCandleFor('EURUSD', 300);

        // Then
        expect(currentCandle).toBeInstanceOf(Candle)
    })

    it('should get last candle again for EURUSD', async () => {
        mockedDerivAPI.candles.mockImplementation(() => getDerivServerResponse(1))
        // Given
        const currentCandle = await derivClient.getCurrentCandleFor('EURUSD', 300);

        // When
        const lastCandle = await derivClient.getLastCandleAgainFor('EURUSD', 300);

        // Then
        expect(currentCandle.getOpenValue()).toEqual(lastCandle.getOpenValue())
    })

    it('should close connection', async () => {
        // Given
        expect(derivClient.getConnectionStatus()).toBe('active');

        // When
        derivClient.closeConnection();

        // Then
        expect(derivClient.getConnectionStatus()).toBe('closed');
    })

    it('should return false to check asset availability', async () => {
        mockedDerivAPI.underlying.mockImplementationOnce((asset: string) => ({_data: {}}))
        mockedDerivAPI.underlying.mockImplementationOnce((asset: string) => ({_data: { is_open: 0 }}))
        // Given

        // When
        const availability = await derivClient.checkAssetAvailability('INVALID ASSET');
        const availability2 = await derivClient.checkAssetAvailability('INVALID ASSET');

        // Then
        expect(availability).toBe(false);
        expect(availability2).toBe(false);
    })

    it('should return false to check asset availability', async () => {
        mockedDerivAPI.underlying.mockImplementation((asset: string) => ({_data: { is_open: 1}}))
        // Given

        // When
        const availability = await derivClient.checkAssetAvailability('INVALID ASSET');

        // Then
        expect(availability).toBe(true);
    })
})