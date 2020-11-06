import dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import Signal from './model/Signal';
import bodyParser from 'body-parser';
import RequestService from './service/RequestService';
import Logger from './service/Logger';
import RequestParser from './service/RequestParser';
import TradingManager from './model/TradingManager';


const app = express();
app.use(bodyParser.json())
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
            let validatedSignal;
            if (new Date().getHours() >= 12 && new Date().getHours() <= 15) {
                validatedSignal = signal;
                console.log('NO SIGNAL VALIDATION!')
            } else {
                validatedSignal = await tradingManager.validateSignal(signal);
                console.log('WITH SIGNAL VALIDATION!')
            }
            console.log('SIGNAL', signal);
            console.log('VALIDATED SIGNAL', validatedSignal)
            const operationResult = await tradingManager.runSignal(validatedSignal);
            Logger.info(`Operation result:`, operationResult);
            Logger.info(`Sending operation result to Telegram Bot`);
            await requestService.post('/operation-result', operationResult);
            Logger.info(`Operation result sent and websocket connection closed`);
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