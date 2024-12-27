const fs = require('fs');
const path = require('path');
const databaseHandler = require('./database.js');

const commands = new Map();

// Load admin commands
const adminCommandFiles = fs.readdirSync(path.join(__dirname, '../commands/admin')).filter(file => file.endsWith('.js'));
for (const file of adminCommandFiles) {
    const command = require(path.join(__dirname, '../commands/admin', file));
    commands.set(command.name, command);
}

// Load user commands
const userCommandFiles = fs.readdirSync(path.join(__dirname, '../commands/user')).filter(file => file.endsWith('.js'));
for (const file of userCommandFiles) {
    const command = require(path.join(__dirname, '../commands/user', file));
    commands.set(command.name, command);
}

// Load interaction commands
const interactCommandFiles = fs.readdirSync(path.join(__dirname, '../commands/interact')).filter(file => file.endsWith('.js'));
for (const file of interactCommandFiles) {
    const command = require(path.join(__dirname, '../commands/interact', file));
    commands.set(command.name, command);
}

module.exports = {
    execute: async (client, message, commandName, args) => {
        const command = commands.get(commandName);
        if (!command) return;

        try {
            if (command.requiresDatabase && !databaseHandler.isConnected()) {
                return message.reply('Database is not connected. This command requires a valid MongoDB configuration.');
            }
            await command.execute(client, message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command.');
        }
    }
};
