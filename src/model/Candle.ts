import { CandleData } from './interfaces/Candle';
import { Timebox } from './interfaces/Timebox';

export default class Candle {
    private closeValue: number;
    private openValue: number;
    private highValue: number;
    private lowValue: number;
    private time: Date;
    private timebox: Timebox;

    constructor(candleData: CandleData, timebox: Timebox) {
        this.closeValue = candleData.close;
        this.openValue = candleData.open;
        this.highValue = candleData.high;
        this.lowValue = candleData.low;
        this.time = this.epochToDate(candleData.epoch);
        this.timebox = timebox;
    }

    private epochToDate(timeInEpoch: number): Date {
        const date = new Date(0);
        date.setUTCSeconds(timeInEpoch);
        return date;
    }

    getTime() {
        return this.time;
    }

    getCloseValue() {
        return this.closeValue;
    }

    getOpenValue() {
        return this.openValue;
    }

    getHighValue() {
        return this.highValue;
    }

    getLowValue() {
        return this.lowValue;
    }

    getTimebox() {
        return this.timebox;
    }
}