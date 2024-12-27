const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'celebrate',
    description: 'Celebrates with a mentioned user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to celebrate with.');
        }

        if (user.id === message.author.id) {
            return message.reply("You can't celebrate with yourself!");
        }

        if (user.bot) {
            return message.reply("You can't celebrate with a bot!");
        }

        try {
            const response = await axios.get('https://api.otakugifs.xyz/gif', {
                params: {
                    reaction: 'celebrate',
                    format: 'gif'
                }
            });
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setDescription(`${message.member.displayName} celebrated with ${message.guild.members.cache.get(user.id).displayName}`)
                .setImage(gifUrl)
                .setColor(0xFFD700) // Gold
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the celebrate GIF.');
        }
    }
};
