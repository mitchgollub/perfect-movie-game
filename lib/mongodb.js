import MongoClient from 'mongodb';
import { Movie } from '../models/movie';
import sanitize from 'mongo-sanitize';

const mongoHost = process.env.MONGO_HOST;
const mongoDb = process.env.MONGO_DB;
let cachedConnection;

const connect = async function () {
    if (!cachedConnection || !cachedConnection.isConnected) {
        cachedConnection = await MongoClient.connect(mongoHost, {
            useUnifiedTopology: true,
        });
    }

    return cachedConnection;
};

export default {
    async insertMovieDocument(document) {
        const client = await connect();
        const collection = client.db(mongoDb).collection('movies');

        // Current schema version
        document.version = 1.0;

        // Mongo is case-sensitive, store request as UpperCase
        document.request = document.request.toUpperCase();

        await collection.insertOne(sanitize(document), { writeConcern: { w: 0 } });

        return document;
    },

    async findMovieDocument(query) {
        const client = await connect();
        const collection = client.db(mongoDb).collection('movies');
        const result = await collection.findOne({
            request: sanitize(query.toUpperCase()),
        });

        if (result) {
            return new Movie(result);
        }

        return null;
    }
};
