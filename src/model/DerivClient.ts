import DerivAPI from '@deriv/deriv-api';
import WebSocket from 'ws';
import { DerivServerResponse } from './interfaces/Candle';
import Candle from './Candle';
import subSeconds from 'date-fns/subSeconds'
import { Timebox } from './interfaces/Timebox';
import Logger from '../service/Logger';

export type HistoryRange = {
    start: number | Date,
    end: number | Date,
    count: number
}

export type CandlesParam = {
    granularity: number | 60,
    symbol: string,
    range: HistoryRange
}

export default class DerivClient {
    private _derivAPI: DerivAPI;
    private _ws: WebSocket;
    private _connectionStatus: string;

    constructor(webSocket?: WebSocket, derivAPI?: DerivAPI) {
        webSocket ?
            this._ws = webSocket :
            this._ws = new WebSocket('wss://frontend.binaryws.com/websockets/v3?l=EN&app_id=23707');
        derivAPI ?
            this._derivAPI = derivAPI :
            this._derivAPI = new DerivAPI({ connection: this._ws });
        this._connectionStatus = 'active';
    }

    async getCandles(candlesParam: CandlesParam): Promise<Candle[]> {
        Logger.info(`Getting candles`, candlesParam);
        try {
            const response = await this._derivAPI.candles(candlesParam) as DerivServerResponse;
            return response._data.list.map(responseData => {
                return new Candle(responseData.raw, candlesParam.granularity);
            })
        } catch (err) {
            Logger.error('Error while getting candles from server', err);
            throw new Error('Error while getting candles from server');
        }
    }

    getConnectionStatus() {
        return this._connectionStatus
    }

    async getCurrentCandleFor(asset: string, timebox: Timebox): Promise<Candle> {
        Logger.info(`Getting current candle for ${asset}`);
        const currentCandle = await this.getCandles({granularity: timebox, symbol: `frx${asset}`, range: {start: subSeconds(new Date(), timebox * 2), end: new Date(), count: 1} })
        return currentCandle[0];
    }

    async getLastCandleAgainFor(asset: string, timebox: Timebox): Promise<Candle> {
        Logger.info(`Getting last candle again for ${asset}`);
        const currentCandle = await this.getCandles({granularity: timebox, symbol: `frx${asset}`, range: {start: subSeconds(new Date(), timebox * 2), end: new Date(), count: 2} })
        return currentCandle[0];
    }

    closeConnection() {
        Logger.info(`Closing websocket connection`);
        try {
            this._ws.close()
            this._connectionStatus = 'closed';
        } catch (err) {
            Logger.error('Error while closing web socket connection', err)
            throw new Error('Error while closing web socket connection');
        }
    }
}