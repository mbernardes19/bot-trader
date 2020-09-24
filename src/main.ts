import dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import Signal from './model/Signal';
import bodyParser from 'body-parser';
import CacheService from './service/CacheService';
import RequestService from './service/RequestService';
import Logger from './service/Logger';
import RequestParser from './service/RequestParser';
import TradingManager from './model/TradingManager';

const app = express();
app.use(bodyParser.json())
const cacheService = new CacheService();
const requestService = new RequestService();

app.post('/check-signal', (req: Request, res: Response) => {
    let signalData;
    let signal;
    try {
        signalData = RequestParser.toSignalData(req);
        signal = new Signal(signalData);
        Logger.info(`Created signal`);
    } catch (err) {
        res.status(400).send();
        return;
    }

    res.status(200).send();

    (async () => {
        const tradingManager = new TradingManager()
        try {
            const operationResult = await tradingManager.runSignal(signal);
            Logger.info(`Operation result:`, operationResult);
            cacheService.storeOperationResult(operationResult);
            Logger.info(`Sending operation result to Telegram Bot:`, operationResult);
            await requestService.post('/operation-result', operationResult);
            Logger.info(`Operation result sent and websocket connection closed`);
        } catch (err) {
            Logger.error(`An error occurred while checking signal ${JSON.stringify(req.body)}`, err)
        }
    })()
})

app.listen(3000, () => Logger.info('Conectado na porta 3000'))