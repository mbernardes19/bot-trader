import MongoClient from 'mongodb';
import { OperationResult } from '../model/SignalRunner';

export default class StorageService {
    private _db: MongoClient.Db;

    async connectToDb() {
        const client = await MongoClient.connect(process.env.MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
        this._db = client.db('bot01');
    }

    async storeOperationResult(operationResult: OperationResult) {
        const collection = this._db.collection('signal_results')
        await collection.save(operationResult);
    }

    async getAllOperationResults() {
        const collection = this._db.collection<OperationResult>('signal_results')
        return await collection.find().toArray();
    }

    async clearAllOperationResults() {
        const collection = this._db.collection('signal_results')
        await collection.deleteMany({});
    }
}