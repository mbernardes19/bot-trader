import DerivAPI from '@deriv/deriv-api';
import WebSocket from 'ws';
import { Candle, DerivServerResponse } from './interfaces/Candle';
import subSeconds from 'date-fns/subSeconds'

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

    constructor() {
        this._ws = new WebSocket('wss://frontend.binaryws.com/websockets/v3?l=EN&app_id=23707');
        this._derivAPI = new DerivAPI({ connection: this._ws });
    }

    async getCandles(candlesParam: CandlesParam): Promise<Candle[]> {
        try {
            const response = await this._derivAPI.candles(candlesParam) as DerivServerResponse;
            console.log('RESPONSE', response)
            return response._data.list.map(responseData => {
                console.log(responseData.raw)
                return responseData.raw
            })
        } catch (err) {
            console.error(err);
            throw new Error('Error while getting candles from server');
        }
    }

    async getCurrentCandleFor(asset: string, timebox: number): Promise<Candle> {
        const currentCandle = await this.getCandles({granularity: timebox, symbol: `frx${asset}`, range: {start: subSeconds(new Date(), timebox * 2), end: new Date(), count: 1} })
        return currentCandle[0];
    }

    closeConnection() {
        try {
            this._ws.close()
        } catch (err) {
            console.error(err)
            throw new Error('Error while closing web socket connection');
        }
    }
}