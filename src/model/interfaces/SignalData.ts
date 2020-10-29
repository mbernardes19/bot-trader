export enum Action {
    PUT='PUT', CALL='CALL'
}

export interface Asset {
    pair: string;
    action: Action;
}

export interface SignalData {
    time: string;
    assetList: Asset[];
    expiration: number;
    telegramMessageId: number;
    telegramChannelId: number;
    gale: boolean
}