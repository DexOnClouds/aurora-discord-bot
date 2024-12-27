const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'angry',
    description: 'Shows anger towards a mentioned user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to show anger towards.');
        }

        if (user.id === message.author.id) {
            return message.reply("You can't be angry at yourself!");
        }

        if (user.bot) {
            return message.reply("You can't be angry at a bot!");
        }

        try {
            const response = await axios.get('https://api.otakugifs.xyz/gif', {
                params: {
                    reaction: 'mad',
                    format: 'gif'
                }
            });
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setDescription(`${message.member.displayName} is angry at ${message.guild.members.cache.get(user.id).displayName}`)
                .setImage(gifUrl)
                .setColor(0xFF4500) // Orange Red
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the angry GIF.');
        }
    }
};
