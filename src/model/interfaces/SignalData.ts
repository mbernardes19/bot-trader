export interface SignalData {
    time: string;
    asset: string;
    action: string;
    expiration: number;
    telegramMessageId: number;
    telegramChannelId: number;
    gale: boolean
}