import NodeCache from 'node-cache';
import { OperationResult } from './SignalRunner';
import Logger from './Logger';

export default class CacheService {
    private _cache: NodeCache;

    constructor() {
        this._cache = new NodeCache();
    }

    storeOperationResult(operationResult: OperationResult): void {
        try {
            let operationsResult = this._cache.get<OperationResult[]>('operation_result');
            if (!operationsResult) {
                operationsResult = [];
            }
            operationsResult.push(operationResult);
            this._cache.set('operations_result', operationsResult);
        } catch (err) {
            Logger.error(`An error occurred while trying to store an operation result ${operationResult}`, err);
            throw new Error(`An error occurred while trying to store an operation result ${operationResult}`);
        }
    }

    retrieveLastOperationResult(): OperationResult {
        try {
            const operationsResult = this._cache.get<OperationResult[]>('operation_result');
            const lastIndex = operationsResult.length - 1;
            const lastOperation = operationsResult[lastIndex];
            operationsResult.splice(lastIndex, 1);
            this._cache.set('operations_result', operationsResult);
            return lastOperation;
        } catch (err) {
            Logger.error(`An error occurred while trying to retrieve last operation result`, err);
            throw new Error(`An error occurred while trying to retrieve last operation result`);
        }
    }
}