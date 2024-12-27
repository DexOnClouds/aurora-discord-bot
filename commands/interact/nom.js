const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nom',
    description: 'Noms a mentioned user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to nom.');
        }

        if (user.id === message.author.id) {
            return message.reply("You can't nom yourself!");
        }

        if (user.bot) {
            return message.reply("You can't nom a bot!");
        }

        try {
            const response = await axios.get('https://api.otakugifs.xyz/gif', {
                params: {
                    reaction: 'nom',
                    format: 'gif'
                }
            });
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setDescription(`${message.member.displayName} nommed ${message.guild.members.cache.get(user.id).displayName}`)
                .setImage(gifUrl)
                .setColor(0xFF8C00) // Dark Orange
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the nom GIF.');
        }
    }
};
