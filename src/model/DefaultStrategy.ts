import TradingStrategy from "./TradingStrategy";
import Signal from "./Signal";
import TradingClient from "./TradingClient";
import { Timebox } from "./interfaces/Timebox";
import { subSeconds } from "date-fns";
import Candle from "./Candle";
import { Action } from "./interfaces/SignalData";
import { isCall, isPut } from "../utils/candles";

export default class DefaultStrategy implements TradingStrategy {

    constructor() {}

    async validate(tradingClient: TradingClient, signal: Signal) {
        const tradingRequests: Promise<Candle[]>[] = [];
        const assetsAvailabilityRequest: Promise<boolean>[] = [];

        signal.getAssetList().map(asset => {
            console.log('CHECK AVAILABILITY FOR ASSET', asset)
            assetsAvailabilityRequest.push(tradingClient.checkAssetAvailability(asset.pair));
        })

        // const candles = await Promise.all<Candle[]>(tradingRequests);
        // const promiseResult = await Promise.allSettled(tradingRequests)
        // promiseResult.forEach(r => r.status)

        const assetsAvailability = await Promise.all(assetsAvailabilityRequest);
        console.log('ASSETS AVAI', assetsAvailability)

        signal.getAssetList().map((asset, index) => {
            if (assetsAvailability[index]) {
                tradingRequests.push(tradingClient.getCandles({granularity: Timebox.M5, symbol: `frx${asset.pair}`, range: {start: subSeconds(new Date(), Timebox.M5 * 5), end: new Date(), count: 5}}))
            } else {
                tradingRequests.push(new Promise((res, rej) => res(undefined)))
            }
        })

        let candles: Candle[][];
        try {
            candles = await Promise.all(tradingRequests)
            candles.forEach(candle => {
                if (candle) {
                    candle.pop()
                }
            })
        } catch (err) {
            console.log(err)
        }

        console.log(candles[0])
        console.log(candles[1])
        console.log(candles[2])
        console.log(signal.getAssetList());
        const validatedAssetList = signal.getAssetList().map((asset, index) => {
            if (!candles[index]) {
                asset.inStrategy = true;
                return asset;
            }
            if (asset.action === Action.CALL) {
                if (
                    isCall(candles[index][0]) &&
                    isPut(candles[index][1]) &&
                    isPut(candles[index][2]) &&
                    isPut(candles[index][3])
                ) {
                    asset.inStrategy = true;
                    return asset;
                } else {
                    asset.inStrategy = false;
                    return asset;
                }
            } else if (asset.action === Action.PUT) {
                if (
                    isPut(candles[index][0]) &&
                    isCall(candles[index][1]) &&
                    isCall(candles[index][2]) &&
                    isCall(candles[index][3])
                ) {
                    asset.inStrategy = true;
                    return asset;
                } else {
                    asset.inStrategy = false;
                    return asset;
                }
            } else {
                return asset;
            }
        })

        signal.setAssetList(validatedAssetList);
        return signal
    }
}