import { Request } from "express";
import { SignalData } from "../model/interfaces/Signal";
import Logger from "./Logger";

export default class RequestParser {
    static toSignalData(request: Request): SignalData {
        try {
            Logger.info(`Parsing request to signal data`, request.body);
            const {body} = request;
            if (!body.action || !body.asset || !body.time || !body.expiration) {
                throw new Error(`Incorrect request body format for SignalData`);
            }
            Logger.info(`Request parsed to signal data`);
            return {
                action: body.action,
                asset: body.asset,
                time: body.time,
                expiration: body.expiration
            }
        } catch (err) {
            Logger.error(`Error while parsing SignalData from Request ${JSON.stringify(request.body)}`, err);
            throw new Error(`Error while parsing SignalData from Request ${JSON.stringify(request.body)}`);
        }
    }
}