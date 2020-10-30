import Candle from "../model/Candle";

export const isCall = (candle: Candle): boolean => {
    return candle.getOpenValue() < candle.getCloseValue() ? true : false
}

export const isPut = (candle: Candle): boolean => {
    return candle.getOpenValue() > candle.getCloseValue() ? true : false
}