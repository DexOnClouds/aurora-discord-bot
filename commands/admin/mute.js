const { EmbedBuilder } = require('discord.js');
const databaseHandler = require('../../handler/database.js');
const ms = require('ms');

module.exports = {
    name: 'mute',
    description: 'Mute a user in the server for a specified duration.',
    execute: async (client, message, args) => {
        const guildConfig = await databaseHandler.getGuildConfig(message.guild.id);

        if (!guildConfig || (!guildConfig.muteAllowedRoles && !guildConfig.muteAllowedUsers)) {
            return message.reply('<:aurora_wrong:1322200715598368898> | The admin roles are not setup. Ask your server administrator to set them up using `!setup`.');
        }

        const hasRole = message.member.roles.cache.some(role => guildConfig.muteAllowedRoles?.includes(role.id));
        const hasPermission = hasRole || guildConfig.muteAllowedUsers?.includes(message.author.id);

        if (!hasPermission) {
            return message.reply('<:aurora_wrong:1322200715598368898> | You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('<:aurora_wrong:1322200715598368898> | Please mention a user to mute.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('<:aurora_wrong:1322200715598368898> | That user is not in the server.');
        }

        if (!member.moderatable) {
            return message.reply('<:aurora_wrong:1322200715598368898> | I cannot mute that user.');
        }

        const duration = args.slice(1).join(' ');
        if (!duration) {
            return message.reply('<:aurora_wrong:1322200715598368898> | Please specify a duration for the mute (e.g., 1d12h13m1s).');
        }

        const time = ms(duration);
        if (isNaN(time)) {
            return message.reply('<:aurora_wrong:1322200715598368898> | Invalid duration format. Please use a valid format (e.g., 1d12h13m1s).');
        }

        await member.timeout(time);

        const embed = new EmbedBuilder()
            .setTitle('<:aurora_timeout:1322196127881363507> User Muted')
            .setDescription(`<:aurora_timeout:1322196127881363507> | ${user.tag} has been muted in the server for ${duration} .`)
            .setColor('#FF69B4') // Hot pink
            .setFooter({ text: 'Aurora bot' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
