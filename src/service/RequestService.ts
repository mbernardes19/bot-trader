import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Logger from './Logger';

export default class RequestService {
    private _request: AxiosInstance;

    constructor() {
        this._request = this.createBaseRequest();
    }

    private createBaseRequest(): AxiosInstance {
        return axios.create({
            baseURL: 'http://metodosemprerico.kinghost.net:21634',
            // baseURL: 'http://localhost:6000',
            headers: { 'Content-Type': 'application/json'}
        })
    }

    async post(url: string, data: any): Promise<AxiosResponse> {
        Logger.info(`Sending POST request to: ${url} with data:`, data);
        try {
            const response = await this._request.post(url, data);
            Logger.info(`POST request sent, got response`);
            return response
        } catch (err) {
            Logger.error(`An error occurred while sending a post request to ${url}`, err);
            throw new Error(`An error occurred while sending a post request to ${url}`)
        }
    }


}