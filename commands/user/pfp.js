const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pfp',
    description: 'Shows user\'s profile picture',
    execute: async (client, message, args) => {
        // Get the target user (mentioned user or message author)
        const user = message.mentions.users.first() || message.author;

        // Get avatar URL in highest quality
        const avatarURL = user.displayAvatarURL({ 
            size: 4096, 
            dynamic: true 
        });

        const embed = new EmbedBuilder()
            .setTitle(`<:aurora_icon:1322195871349215273> ${user.tag}'s Profile Picture`)
            .setDescription(`<:aurora_right:1322200775258144882> | [Click here to download](${avatarURL})`)
            .setImage(avatarURL)
            .setColor('#FF69B4')
            .setFooter({ text: 'Aurora bot' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};
