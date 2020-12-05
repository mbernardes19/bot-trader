import app from '../../src/main';
import request from 'supertest';
import { SignalData, Action } from '../../src/model/interfaces/SignalData';
import dotenv from 'dotenv';
import Signal from '../../src/model/Signal';
import { operationResultsMock, signalDataMock } from './ApiMocks';
dotenv.config()

let resultSent = false;
jest.mock('../../src/service/RequestService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            post: () => {resultSent = true}
        }
    })
})

let dataStored = false;
jest.mock('../../src/service/StorageService', () => {
    return jest.fn().mockImplementation(() => {
        return {
            connectToDb: jest.fn(),
            storeOperationResult: () => {dataStored = true}
        }
    })
})

let getCheckWinMock = 0;
const checkWinMock = num => operationResultsMock[num]
jest.mock('../../src/model/SignalRunner', () => {
    return jest.fn().mockImplementation(() => {
        return {
            validate: (signal: Signal) => signal,
            'run': jest.fn(),
            checkWin: () => checkWinMock(getCheckWinMock),
            closeTradingClientConnection: jest.fn()
        }
    })
})

describe('API Test', () => {
    jest.useFakeTimers()
    it('sends request to bot endpoint after signal checking is successful ', async () => {
        const req = signalDataMock[0]

        await request(app).post('/check-signal').send(req);
        expect(resultSent).toBe(true)
    })

    it('stores operation result data when signal is extraAnalysis', async () => {
        const req = signalDataMock[1]
        getCheckWinMock = 1;

        await request(app).post('/check-signal').send(req);
        expect(dataStored).toBe(true)
    })
})