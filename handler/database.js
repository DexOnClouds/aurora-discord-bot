const { MongoClient } = require('mongodb');
const config = require('../config.js');

let db;
let collection;
let isConnected = false;

module.exports = {
    connect: async () => {
        if (!config.mongoURI || !config.dbName || !config.collectionName) {
            console.error('❌ MongoDB connection error: Invalid MongoDB configuration. Please provide a valid MongoDB URI, database name, and collection name.');
            return;
        }

        try {
            const client = new MongoClient(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
            await client.connect();
            db = client.db(config.dbName);
            collection = db.collection(config.collectionName);
            isConnected = true;
            console.log('✅ MongoDB connected');
        } catch (error) {
            console.error('❌ MongoDB connection error:', error.message);
        }
    },
    getGuildConfig: async (guildId) => {
        if (!isConnected) {
            throw new Error('Database not connected');
        }
        return await collection.findOne({ serverId: guildId });
    },
    updateGuildConfig: async (guildId, update) => {
        if (!isConnected) {
            throw new Error('Database not connected');
        }
        await collection.updateOne({ serverId: guildId }, { $set: update }, { upsert: true });
    },
    getCollection: () => {
        if (!isConnected) {
            throw new Error('Database not connected');
        }
        return collection;
    },
    isConnected: () => isConnected
};
