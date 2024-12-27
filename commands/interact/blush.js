const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'blush',
    description: 'Blushes at a mentioned user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to blush at.');
        }

        if (user.id === message.author.id) {
            return message.reply("You can't blush at yourself!");
        }

        if (user.bot) {
            return message.reply("You can't blush at a bot!");
        }

        try {
            const response = await axios.get('https://api.otakugifs.xyz/gif', {
                params: {
                    reaction: 'blush',
                    format: 'gif'
                }
            });
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setDescription(`${message.member.displayName} blushed at ${message.guild.members.cache.get(user.id).displayName}`)
                .setImage(gifUrl)
                .setColor(0xFF69B4) // Hot Pink
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the blush GIF.');
        }
    }
};
