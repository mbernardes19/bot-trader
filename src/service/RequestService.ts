import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Logger from './Logger';

export default class RequestService {
    private _request: AxiosInstance;

    constructor() {
        this._request = this.createBaseRequest();
    }

    private delay(n) {
        return new Promise(done => {
          setTimeout(() => {
            done();
          }, n);
        });
    };

    private createBaseRequest(): AxiosInstance {
        if (process.env.NODE_ENV === 'production') {
            return axios.create({
                baseURL: 'https://bot.sosvestibular.com/App',
                headers: { 'Content-Type': 'application/json'}
            })
        } else {
            return axios.create({
                // baseURL: 'http://metodosemprerico.kinghost.net:21539',
                baseURL: 'http://localhost:6001/App',
                headers: { 'Content-Type': 'application/json'}
            })
        }
    }

    async post(url: string, data: any): Promise<AxiosResponse> {
        Logger.info(`Sending POST request to: ${url} with data:`, data);
        try {
            const response = await this._request.post(url, data);
            Logger.info(`POST request sent, got response`);
            return response
        } catch (err) {
            if (err.message === 'socket hang up') {
                Logger.info(`Error while sending post request: ${err}. Trying to send it again.`)
                try {
                    await axios.get('http://metodosemprerico.kinghost.net:21563/revive')
                    this.delay(20000);
                    const response = await this._request.post(url, data);
                    Logger.info(`POST request sent, got response`);
                    return response
                } catch (err) {
                    Logger.error(`An error occurred while sending a post request to ${url}`, err);
                    throw new Error(`An error occurred while sending a post request to ${url}`);
                }
            }
            Logger.error(`An error occurred while sending a post request to ${url}`, err);
            throw new Error(`An error occurred while sending a post request to ${url}`);
        }
    }


}