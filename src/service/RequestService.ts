import axios, { AxiosInstance, AxiosResponse } from 'axios';

export default class RequestService {
    private _request: AxiosInstance;

    constructor() {
        this._request = this.createBaseRequest();
    }

    private createBaseRequest(): AxiosInstance {
        return axios.create({
            // baseURL: 'http://metodosemprerico.kinghost.net:21634',
            baseURL: 'http://localhost:6000',
            headers: { 'Content-Type': 'application/json'}
        })
    }

    async post(url: string, data: any): Promise<AxiosResponse> {
        return await this._request.post(url, data);
    }


}