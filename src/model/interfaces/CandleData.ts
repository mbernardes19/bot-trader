export interface DerivServerResponse {
    _data: DerivResponse
}

export interface DerivResponse {
    list?: ResponseData[]
    is_open?: number
}

export interface ResponseData {
    raw: CandleData
}

export interface CandleData {
    epoch: number,
    open: number,
    close: number,
    high: number,
    low: number
}