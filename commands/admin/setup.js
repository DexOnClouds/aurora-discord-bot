const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const databaseHandler = require('../../handler/database.js');
const config = require('../../config.js');

module.exports = {
    name: 'setup',
    description: 'Setup admin roles for kick, ban, and mute.',
    execute: async (client, message, args) => {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('<:aurora_wrong:1322200715598368898> | You do not have permission to use this command.');
        }

        const embed = new EmbedBuilder()
            .setTitle('<:aurora_icon:1322195871349215273> Admin Roles Setup')
            .setDescription('Which roles do you want to setup?')
            .setColor('#FF69B4')
            .setFooter({ text: 'Aurora bot' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('mute').setLabel('Mute').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('kick').setLabel('Kick').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('ban').setLabel('Ban').setStyle(ButtonStyle.Primary)
            );

        const setupMessage = await message.channel.send({ embeds: [embed], components: [row] });
        let currentCollector = setupMessage.createMessageComponentCollector({ 
            componentType: ComponentType.Button, 
            time: 60000 
        });

        currentCollector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ content: 'You do not have permission to interact with this.', ephemeral: true });
                return;
            }

            // Stop the current collector
            currentCollector.stop();

            const action = interaction.customId;
            const collection = databaseHandler.getCollection();
            const serverId = message.guild.id;
            const serverData = await collection.findOne({ serverId });

            const allowedUsers = serverData?.[`${action}AllowedUsers`] || [];
            const allowedRoles = serverData?.[`${action}AllowedRoles`] || [];

            let usersText = 'None';
            if (allowedUsers.length > 0) {
                const userTags = await Promise.all(allowedUsers.map(async id => {
                    const user = await client.users.fetch(id).catch(() => null);
                    return user ? user.tag : id;
                }));
                usersText = userTags.join('\n');
            }

            let rolesText = 'None';
            if (allowedRoles.length > 0) {
                const roleNames = allowedRoles.map(id => {
                    const role = message.guild.roles.cache.get(id);
                    return role ? role.name : id;
                });
                rolesText = roleNames.join('\n');
            }

            const updatedEmbed = new EmbedBuilder()
                .setTitle(`<:aurora_icon:1322195871349215273> Setup ${action.charAt(0).toUpperCase() + action.slice(1)} Role`)
                .setDescription(`<:aurora_right:1322200775258144882> | Would you like to add or remove a role/user?`)
                .addFields(
                    { name: 'Allowed Users', value: usersText },
                    { name: 'Allowed Roles', value: rolesText }
                )
                .setColor('#FF69B4')
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            const addRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('addUser').setLabel('Add User').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('addRole').setLabel('Add Role').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('deleteUser').setLabel('Remove User').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('deleteRole').setLabel('Remove Role').setStyle(ButtonStyle.Danger)
                );

            await setupMessage.edit({ embeds: [updatedEmbed], components: [addRow] });
            await interaction.deferUpdate();

            // Create new collector for the action message
            currentCollector = setupMessage.createMessageComponentCollector({ 
                componentType: ComponentType.Button, 
                time: 60000,
                filter: i => i.user.id === message.author.id 
            });

            currentCollector.on('collect', async (subInteraction) => {
                const subAction = subInteraction.customId;
                const isAdding = subAction.startsWith('add');
                const type = subAction.includes('User') ? 'user' : 'role';
                
                await message.channel.send(`<:aurora_right:1322200775258144882> | Please provide the ${type} ID or mention to ${isAdding ? 'add to' : 'remove from'} the ${action} command.`);
                await subInteraction.deferUpdate();

                const filter = m => m.author.id === message.author.id;
                const inputCollector = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

                inputCollector.on('collect', async (inputMessage) => {
                    let id;
                    let name;

                    if (type === 'user') {
                        const user = inputMessage.mentions.users.first() || await client.users.fetch(inputMessage.content.trim()).catch(() => null);
                        if (!user) {
                            await message.channel.send('<:aurora_wrong:1322200715598368898> | Invalid user ID or mention.');
                            return;
                        }
                        id = user.id;
                        name = user.tag;
                    } else {
                        const role = inputMessage.mentions.roles.first() || message.guild.roles.cache.get(inputMessage.content.trim());
                        if (!role) {
                            await message.channel.send('<:aurora_wrong:1322200715598368898> | Invalid role ID or mention.');
                            return;
                        }
                        id = role.id;
                        name = role.name;
                    }

                    const arrayKey = type === 'user' ? `${action}AllowedUsers` : `${action}AllowedRoles`;
                    const currentArray = serverData?.[arrayKey] || [];
                    
                    if (isAdding) {
                        if (currentArray.includes(id)) {
                            await message.channel.send(`<:aurora_wrong:1322200715598368898> | This ${type} already has permission to use the \`${action}\` command.`);
                            return;
                        }
                        currentArray.push(id);
                    } else {
                        if (!currentArray.includes(id)) {
                            await message.channel.send(`<:aurora_wrong:1322200715598368898> | This ${type} doesn't have permission to use the \`${action}\` command.`);
                            return;
                        }
                        const index = currentArray.indexOf(id);
                        currentArray.splice(index, 1);
                    }

                    // Update database
                    await collection.updateOne(
                        { serverId },
                        { $set: { [arrayKey]: currentArray } },
                        { upsert: true }
                    );

                    // Fetch updated data and refresh embed
                    const updatedData = await collection.findOne({ serverId });
                    const updatedUsers = updatedData?.[`${action}AllowedUsers`] || [];
                    const updatedRoles = updatedData?.[`${action}AllowedRoles`] || [];

                    let newUsersText = 'None';
                    if (updatedUsers.length > 0) {
                        const userTags = await Promise.all(updatedUsers.map(async id => {
                            const user = await client.users.fetch(id).catch(() => null);
                            return user ? user.tag : id;
                        }));
                        newUsersText = userTags.join('\n');
                    }

                    let newRolesText = 'None';
                    if (updatedRoles.length > 0) {
                        const roleNames = updatedRoles.map(id => {
                            const role = message.guild.roles.cache.get(id);
                            return role ? role.name : id;
                        });
                        newRolesText = roleNames.join('\n');
                    }

                    const refreshedEmbed = new EmbedBuilder()
                        .setTitle(`<:aurora_icon:1322195871349215273> Setup ${action.charAt(0).toUpperCase() + action.slice(1)} Role`)
                        .setDescription(`<:aurora_right:1322200775258144882> | Successfully ${isAdding ? 'added' : 'removed'} ${type} \`${name}\` ${isAdding ? 'to' : 'from'} the \`${action}\` command permissions.`)
                        .addFields(
                            { name: 'Allowed Users', value: newUsersText },
                            { name: 'Allowed Roles', value: newRolesText }
                        )
                        .setColor('#FF69B4')
                        .setFooter({ text: 'Aurora bot' })
                        .setTimestamp();

                    await setupMessage.edit({ embeds: [refreshedEmbed], components: [addRow] });
                    await inputMessage.delete().catch(() => {});
                });
            });
        });

        currentCollector.on('end', () => {
            try {
                setupMessage.edit({ components: [] });
            } catch (error) {
                console.error('Error removing components:', error);
            }
        });
    }
};
