import DerivAPI from '@deriv/deriv-api';
import WebSocket from 'ws';

type HistoryRange = {
    start: number | Date,
    end: number | Date,
    count: number
}

type CandlesParam = {
    granularity: number,
    asset: string,
    range: HistoryRange
}

export default class DerivClient {
    private _derivAPI: DerivAPI;
    private _ws: WebSocket;

    constructor() {
        this._ws = new WebSocket('wss://frontend.binaryws.com/websockets/v3?l=EN&app_id=23707');
        this._derivAPI = new DerivAPI({ connection: this._ws });
    }

    getCandles(candlesParam: CandlesParam) {}
}