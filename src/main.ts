import dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import Signal from './model/Signal';
import bodyParser from 'body-parser';
import RequestService from './service/RequestService';
import Logger from './service/Logger';
import RequestParser from './service/RequestParser';
import TradingManager from './model/TradingManager';
import StorageService from './service/StorageService';
import ScheduleService from './service/ScheduleService';


const app = express();
app.use(bodyParser.json())
const requestService = new RequestService();
const storageService = new StorageService();
(async () => {
    try {
        await storageService.connectToDb()
    } catch (err) {
        Logger.error(`Failed to connect Storage Service to DB`, err)
        process.exit()
    }
})()

const scheduleService = new ScheduleService();
scheduleService.schedule('00 17 * * 1-5', async () => {
    try {
        const operationResults = await storageService.getAllOperationResults()
        await requestService.post('/operation-result', operationResults);
        await storageService.clearAllOperationResults();
    } catch (err) {
        console.log(err)
    }       
})



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
            const validatedSignal = await tradingManager.validateSignal(signal);
            console.log('SIGNAL', signal);
            console.log('VALIDATED SIGNAL', validatedSignal)
            const operationResult = await tradingManager.runSignal(validatedSignal);
            if (operationResult.type !== 'extraAnalysis') {
                Logger.info(`Operation result:`, operationResult);
                Logger.info(`Sending operation result to Telegram Bot`);
                await requestService.post('/operation-result', operationResult);
                Logger.info(`Operation result sent and websocket connection closed`);
            } else {
                await storageService.storeOperationResult(operationResult)
            }
        } catch (err) {
            Logger.error(`An error occurred while checking signal ${JSON.stringify(req.body)}`, err)
        }
    })()
})

if (process.env.NODE_ENV === 'production') {
    app.listen(3000, () => Logger.info('Conectado na porta 3000'))
} else {
    app.listen(4000, () => Logger.info('Conectado na porta 4000'))
}

export default app;