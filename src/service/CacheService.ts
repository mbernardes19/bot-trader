import NodeCache from 'node-cache';
import { OperationResult } from '../model/SignalRunner';
import Logger from './Logger';

export default class CacheService {
    private _cache: NodeCache;

    constructor() {
        this._cache = new NodeCache();
    }

    storeOperationResult(operationResult: OperationResult): void {
        try {
            Logger.info(`Storing operation result in cache:`, operationResult);
            let operationsResult = this._cache.get<OperationResult[]>('operation_result');
            if (!operationsResult) {
                operationsResult = [];
            }
            operationsResult.push(operationResult);
            this._cache.set('operations_result', operationsResult);
            Logger.info(`Operation result stored`);
        } catch (err) {
            Logger.error(`An error occurred while trying to store an operation result ${JSON.stringify(operationResult)}`, err);
            throw new Error(`An error occurred while trying to store an operation result ${JSON.stringify(operationResult)}`);
        }
    }

    retrieveLastOperationResult(): OperationResult {
        try {
            Logger.info(`Retrieving last operation result from cache`);
            const operationsResult = this._cache.get<OperationResult[]>('operation_result');
            const lastIndex = operationsResult.length - 1;
            const lastOperation = operationsResult[lastIndex];
            operationsResult.splice(lastIndex, 1);
            this._cache.set('operations_result', operationsResult);
            Logger.info(`Last operation result retrieved:`, lastOperation);
            return lastOperation;
        } catch (err) {
            Logger.error(`An error occurred while trying to retrieve last operation result`, err);
            throw new Error(`An error occurred while trying to retrieve last operation result`);
        }
    }
}