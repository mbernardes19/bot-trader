import { Candle, DerivServerResponse } from '../src/model/interfaces/Candle';

export function getDerivServerResponse(): DerivServerResponse {
    return {_data: {list: [{raw: getCandle()}]}}
}

export function getCandle(): Candle {
    return { open: 123, close: 234, epoch: 245, high: 234, low: 345}
}

export function generateRandomCandle() {
    return { open: Math.random()*10, close: Math.random()*10, epoch: Math.random()*10, high: Math.random()*10, low: Math.random()*10}
}