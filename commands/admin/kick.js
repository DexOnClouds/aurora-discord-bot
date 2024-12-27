const { EmbedBuilder } = require('discord.js');
const databaseHandler = require('../../handler/database.js');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server.',
    execute: async (client, message, args) => {
        const guildConfig = await databaseHandler.getGuildConfig(message.guild.id);

        if (!guildConfig || (!guildConfig.kickAllowedRoles && !guildConfig.kickAllowedUsers)) {
            return message.reply('<:aurora_wrong:1322200715598368898> | The admin roles are not setup. Ask your server administrator to set them up using `!setup`.');
        }

        const hasRole = message.member.roles.cache.some(role => guildConfig.kickAllowedRoles?.includes(role.id));
        const hasPermission = hasRole || guildConfig.kickAllowedUsers?.includes(message.author.id);

        if (!hasPermission) {
            return message.reply('<:aurora_wrong:1322200715598368898> | You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('<:aurora_wrong:1322200715598368898> | Please mention a user to kick.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('<:aurora_wrong:1322200715598368898> | That user is not in the server.');
        }

        if (!member.kickable) {
            return message.reply('<:aurora_wrong:1322200715598368898> | I cannot kick that user.');
        }

        await member.kick();

        const embed = new EmbedBuilder()
            .setTitle('<:aurora_paw:1322196077218238534> User Kicked')
            .setDescription(`<:aurora_paw:1322196077218238534> | ${user.tag} has been kicked from the server.`)
            .setColor('#FF69B4') // Hot pink
            .setFooter({ text: 'Aurora bot' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
