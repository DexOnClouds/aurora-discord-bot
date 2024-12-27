const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kiss',
    description: 'Kisses a mentioned user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to kiss.');
        }

        if (user.id === message.author.id) {
            return message.reply("You can't kiss yourself!");
        }

        if (user.bot) {
            return message.reply("You can't kiss a bot!");
        }

        try {
            const response = await axios.get('https://api.otakugifs.xyz/gif', {
                params: {
                    reaction: 'kiss',
                    format: 'gif'
                }
            });
            const gifUrl = response.data.url; // Adjust according to the API response structure

            const embed = new EmbedBuilder()
                .setDescription(`${message.member.displayName} gave a warm kiss to ${message.guild.members.cache.get(user.id).displayName}`)
                .setImage(gifUrl)
                .setColor(0xFAA9BF)
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the kiss GIF.');
        }
    }
};
