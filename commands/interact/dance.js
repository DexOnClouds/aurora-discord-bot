const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dance',
    description: 'Dances with a mentioned user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to dance with.');
        }

        if (user.id === message.author.id) {
            return message.reply("You can't dance with yourself!");
        }

        if (user.bot) {
            return message.reply("You can't dance with a bot!");
        }

        try {
            const response = await axios.get('https://api.otakugifs.xyz/gif', {
                params: {
                    reaction: 'dance',
                    format: 'gif'
                }
            });
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setDescription(`${message.member.displayName} danced with ${message.guild.members.cache.get(user.id).displayName}`)
                .setImage(gifUrl)
                .setColor(0xFF6347) // Tomato
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the dance GIF.');
        }
    }
};
