const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const config = require('./config.js');
const commandHandler = require('./handler/command.js');
const prefixHandler = require('./handler/prefix.js');
const databaseHandler = require('./handler/database.js');
const stickyHandler = require('./handler/sticky.js');
const axios = require('axios');
const querystring = require('querystring');

// Function to test Spotify connection
async function testSpotifyConnection() {
    try {
        const response = await axios({
            url: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(config.spotify.clientId + ':' + config.spotify.clientSecret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: querystring.stringify({
                grant_type: 'client_credentials'
            })
        });
        if (response.data.access_token) {
            console.log('✅ Spotify Connected');
            return true;
        }
    } catch (error) {
        console.error('❌ Spotify Connection Failed:', error.message);
        return false;
    }
}

// Global map to store Spotify auth codes
global.spotifyAuthCodes = new Map();
global.spotifyTokens = new Map();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Set the bot's activity
    client.user.setActivity(config.activity.name, { type: ActivityType[config.activity.type] });

    // Test connections
    await databaseHandler.connect();
    await testSpotifyConnection();
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = prefixHandler.getPrefix(message);
    if (!message.content.startsWith(prefix)) {
        // Handle sticky messages
        await stickyHandler.handleStickyMessage(message);
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    await commandHandler.execute(client, message, commandName, args);
});

client.login(config.token);
