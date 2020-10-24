import MongoClient from 'mongodb';
import { Movie } from '../models/movie';
import sanitize from 'mongo-sanitize';

const mongoHost = process.env.MONGO_HOST;
const mongoDb = process.env.MONGO_DB;

const connect = async function () {
    console.log('mongohost', mongoHost);
    console.log('mongodb', mongoDb);
    return await MongoClient.connect(mongoHost, {
        useUnifiedTopology: true,
    });
};

export default {
    async insertMovieDocument(document) {
        const client = await connect();
        const collection = client.db(mongoDb).collection('movies');

        // Current schema version
        document.version = 1.0;

        // Mongo is case-sensitive, store request as UpperCase
        document.request = document.request.toUpperCase();

        const result = await collection.insertOne(sanitize(document));

        await client.close();
        return document;
    },

    async findMovieDocument(query) {
        const client = await connect();
        const collection = client.db(mongoDb).collection('movies');
        const result = await collection.findOne({
            request: sanitize(query.toUpperCase()),
        });
        await client.close();

        if (result) {
            return new Movie(result);
        }

        return null;
    }
};
