const { EmbedBuilder } = require('discord.js');
const databaseHandler = require('./database.js');

let stickyTimeout = {};

const handleStickyMessage = async (message) => {
    const collection = databaseHandler.getCollection();
    const serverId = message.guild.id;
    const serverData = await collection.findOne({ serverId });
    if (serverData && serverData.stickyEnabled) {
        const stickyMessage = serverData.stickyMessages.find(sm => sm.channelId === message.channel.id);
        if (stickyMessage) {
            const stickyEmbed = new EmbedBuilder()
                .setTitle('STICKY')
                .setDescription(stickyMessage.message)
                .setColor(0x00FF00)
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            // Clear any existing timeout for this channel
            if (stickyTimeout[message.channel.id]) {
                clearTimeout(stickyTimeout[message.channel.id]);
            }

            // Set a new timeout to handle the sticky embed
            stickyTimeout[message.channel.id] = setTimeout(async () => {
                // Fetch the last 100 messages in the channel
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const stickyMessages = messages.filter(msg => msg.author.id === message.client.user.id && msg.embeds.length > 0 && msg.embeds[0].title === 'STICKY');

                // Delete the old sticky embeds
                if (stickyMessages.size > 0) {
                    await message.channel.bulkDelete(stickyMessages);
                }

                // Send the new sticky embed
                await message.channel.send({ embeds: [stickyEmbed] });
            }, 3000); // Wait for 3 seconds
        }
    }
};

module.exports = {
    handleStickyMessage
};
