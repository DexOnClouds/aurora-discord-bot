module.exports = {
    token: 'YOUR_BOT_TOKEN_HERE',
    prefix: '!',
    mongoURI: 'YOUR_MONGO_URI_HERE',
    dbName: 'YOUR_DATABASE_NAME',
    collectionName: 'YOUR_COLLECTION_NAME',
    activity: {
        type: 'PLAYING', // Options: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
        name: 'with your commands!'
    },
    spotify: {
        clientId: 'YOUR_SPOTIFY_CLIENT_ID',  // Needed for song commands
        clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET'
    }
};
