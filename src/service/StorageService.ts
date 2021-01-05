import MongoClient from 'mongodb';
import { OperationResult } from '../model/SignalRunner';

export default class StorageService {
    private _db: MongoClient.Db;
    private _collection: MongoClient.Collection;

    async connectToDb() {
        const client = await MongoClient.connect(process.env.MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
        this._db = client.db('bot01');
        if (process.env.NODE_ENV === 'production') {
            this._collection = this._db.collection('signal_results');
        } else {
            this._collection = this._db.collection('signal_results_test');
        }
    }

    async storeOperationResult(operationResult: OperationResult) {
        await this._collection.save(operationResult);
    }

    async getAllOperationResults() {
        return await this._collection.find().toArray();
    }

    async clearAllOperationResults() {
        await this._collection.deleteMany({});
    }
}