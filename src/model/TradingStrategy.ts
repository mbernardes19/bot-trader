import Signal from "./Signal";
import TradingClient from "./TradingClient";

export default interface TradingStrategy {
    validate(tradingClient: TradingClient, signal: Signal): Promise<Signal>
}