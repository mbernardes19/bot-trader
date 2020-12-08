import { Timebox } from "./interfaces/Timebox";
import { SignalData, Asset } from "./interfaces/SignalData";
import Logger from "../service/Logger";

export default class Signal {
    private assetList: Asset[];
    private expiration: Timebox;
    private telegramMessageId: number;
    private telegramChannelId: number;
    private gale: boolean;
    private type: string;
    private time: string;

    constructor(signalData: SignalData) {
        this.assetList = signalData.assetList;
        this.gale = signalData.gale;
        this.telegramChannelId = signalData.telegramChannelId;
        this.telegramMessageId = signalData.telegramMessageId;
        this.type = signalData.type;
        this.time = signalData.time;
        try {
            this.expiration = this.expirationToTimebox(signalData.expiration);
            this.checkAssetList(this.assetList);
        } catch (err) {
            Logger.error(`Error while creating Signal from SignalData ${JSON.stringify(signalData)}`, err);
            throw new Error(`Error while creating Signal from SignalData ${JSON.stringify(signalData)}`);
        }
    }

    private checkAssetList(assetList: Asset[]) {
        assetList.forEach(asset => {
            if (asset.action.toLowerCase() !== 'PUT'.toLowerCase() && asset.action.toLowerCase() !== 'CALL'.toLowerCase()) {
                throw new Error(`Invalid action ${asset.action} in asset`);
            }
            if (asset.pair.length !== 6) {
                throw new Error(`Invalid pair ${asset.pair} in asset`);
            }
        })

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
                throw new Error('Expiration time not supported');
        }
    }

    getAssetList() {
        return this.assetList;
    }

    setAssetList(assetList: Asset[]) {
        this.assetList = assetList;
    }

    getExpiration() {
        return this.expiration;
    }

    getTelegramMessageId() {
        return this.telegramMessageId;
    }

    getTelegramChannelId() {
        return this.telegramChannelId;
    }

    hasGale() {
        return this.gale;
    }

    getType() {
        return this.type;
    }

    getTime() {
        return this.time;
    }
}