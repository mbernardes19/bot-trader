import NodeCache from 'node-cache';
import { OperationResult } from './SignalRunner';

export default class CacheService {
    private _cache: NodeCache;

    constructor() {
        this._cache = new NodeCache();
    }

    storeOperationResult(operationResult: OperationResult): void {
        let operationsResult = this._cache.get<OperationResult[]>('operation_result');
        if (!operationsResult) {
            operationsResult = [];
        }
        operationsResult.push(operationResult);
        this._cache.set('operations_result', operationsResult);
    }

    retrieveLastOperationResult(): OperationResult {
        const operationsResult = this._cache.get<OperationResult[]>('operation_result');
        const lastIndex = operationsResult.length - 1;
        const lastOperation = operationsResult[lastIndex];
        operationsResult.splice(lastIndex, 1);
        this._cache.set('operations_result', operationsResult);
        return lastOperation;
    }
}