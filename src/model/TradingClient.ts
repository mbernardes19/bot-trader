import { Timebox } from "./interfaces/Timebox";
import { CandlesParam } from "./DerivClient";
import Candle from "./Candle";

export default abstract class TradingClient {
    abstract async getCandles(candlesParam: CandlesParam): Promise<Candle[]>
    abstract async getCurrentCandleFor(asset: string, timebox: Timebox): Promise<Candle>
    abstract async getLastCandleAgainFor(asset: string, timebox: Timebox): Promise<Candle>
    abstract async checkAssetAvailability(asset: string): Promise<boolean>
    abstract closeConnection(): void
}