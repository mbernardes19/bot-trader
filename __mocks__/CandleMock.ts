import { CandleData, DerivServerResponse } from '../src/model/interfaces/CandleData';

export function getDerivServerResponse(n: number): DerivServerResponse {
    let candles = [];
    for(let i = 0; i < n; i++) {
        candles.push({raw: getCandle()})
    }
    return {_data: {list: candles}}
}

export function getCandle(): CandleData {
    return { open: 123, close: 234, epoch: 245, high: 234, low: 345}
}

export function generateRandomCandle() {
    return { open: Math.random()*10, close: Math.random()*10, epoch: Math.random()*10, high: Math.random()*10, low: Math.random()*10}
}