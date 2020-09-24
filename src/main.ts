import DerivClient from './model/DerivClient';
import express, {Request, Response} from 'express';
import { SignalData } from './model/interfaces/Signal';
import Signal from './model/Signal';
import bodyParser from 'body-parser';
import SignalRunner from './service/SignalRunner';
import CacheService from './service/CacheService';
import RequestService from './service/RequestService';
import Logger from './service/Logger';
import RequestParser from './service/RequestParser';

const app = express();
app.use(bodyParser.json())
const cacheService = new CacheService();
const requestService = new RequestService();

app.post('/check-signal', (req: Request, res: Response) => {
    let signalData;
    let signal;
    try {
        signalData = RequestParser.toSignalData(req);
        Logger.info(req.body);
        signal = new Signal(signalData);
    } catch (err) {
        res.status(400).send();
        return;
    }

    res.status(200).send();

    (async () => {
        const derivClient = new DerivClient();
        const signalRunner = new SignalRunner(derivClient);
        try {
            const operationSummary = await signalRunner.run(signal);
            Logger.info(`${operationSummary}`);
            const operationResult = signalRunner.checkWin(operationSummary)
            cacheService.storeOperationResult(operationResult);
            await requestService.post('/operation-result', operationResult);
            derivClient.closeConnection();
        } catch (err) {
            Logger.error(`An error occurred while checking signal ${req.body}`, err)
        }
    })()
})

app.listen(3000, () => Logger.info('Conectado na porta 3000'))