import { Request } from "express";
import { SignalData } from "../model/interfaces/Signal";
import Logger from "./Logger";

export default class RequestParser {
    static toSignalData(request: Request): SignalData {
        try {
            const {body} = request;
            return {
                action: body.action,
                asset: body.asset,
                time: body.time,
                expiration: body.expiration
            }
        } catch (err) {
            Logger.error(`Error while parsing SignalData from Request ${request.body}`, err);
            throw new Error(`Error while parsing SignalData from Request ${request.body}`);
        }
    }
}