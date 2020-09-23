import { Timebox } from "./interfaces/Timebox";
import { SignalData } from "./interfaces/Signal";

export default class Signal {
    private time: Date;
    private asset: string;
    private action: string;
    private expiration: Timebox;

    constructor(signalData: SignalData) {
        this.asset = signalData.asset;
        this.action = signalData.action;
        this.expiration = this.expirationToTimebox(signalData.expiration);
        this.time = this.timeStringToDate(signalData.time);
    }

    private timeStringToDate(timeString: string) {
        const hour = parseInt(timeString.substring(0, 2),10);
        const minutes = parseInt(timeString.substring(3, 5),10);
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth()-1, now.getDate(), hour, minutes, 0)
    }

    private expirationToTimebox(expiration: number) {
        switch(expiration) {
            case 1:
                return Timebox.M1;
            case 2:
                return Timebox.M2;
            case 3:
                return Timebox.M3;
            case 5:
                return Timebox.M5;
            case 10:
                return Timebox.M10;
            case 15:
                return Timebox.M15;
            case 30:
                return Timebox.M30;
            default:
                throw new Error('Expiration valid not supported');
        }
    }

    getAsset() {
        return this.asset;
    }

    getExpiration() {
        return this.expiration;
    }

    getAction() {
        return this.action;
    }
}