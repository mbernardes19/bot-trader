import { Request } from "express";
import { SignalData } from "../model/interfaces/SignalData";
import Logger from "./Logger";

export default class RequestParser {
    static toSignalData(request: Request): SignalData {
        try {
            Logger.info(`Parsing request to signal data`, request.body);
            const {body} = request;
            if (!body.assetList || !body.type || !body.time || !body.expiration || !body.telegramMessageId || !body.telegramChannelId) {
                throw new Error(`Incorrect request body format for SignalData`);
            }
            return {
                assetList: body.assetList,
                time: body.time,
                expiration: body.expiration,
                telegramMessageId: body.telegramMessageId,
                telegramChannelId: body.telegramChannelId,
                gale: body.gale,
                type: body.type
            }
        } catch (err) {
            Logger.error(`Error while parsing SignalData from Request ${JSON.stringify(request.body)}`, err);
            throw new Error(`Error while parsing SignalData from Request ${JSON.stringify(request.body)}`);
        }
    }
}