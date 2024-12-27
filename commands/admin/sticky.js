const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const databaseHandler = require('../../handler/database.js');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    name: 'sticky',
    description: 'Manage sticky messages.',
    requiresDatabase: true,
    execute: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permission to use this command.');
        }

        const collection = databaseHandler.getCollection();
        const serverId = message.guild.id;

        let serverData = await collection.findOne({ serverId });
        if (!serverData) {
            serverData = { serverId, stickyEnabled: false, stickyMessages: [] };
            await collection.insertOne(serverData);
        }

        const embed = new EmbedBuilder()
            .setTitle('Sticky Message Management')
            .setDescription(`Status: ${serverData.stickyEnabled ? 'Enabled' : 'Disabled'}`)
            .setColor(0x00FF00)
            .setFooter({ text: 'Aurora bot' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('toggle')
                    .setLabel(serverData.stickyEnabled ? 'Disable' : 'Enable')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('add')
                    .setLabel('Add')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel('Delete')
                    .setStyle(ButtonStyle.Danger)
            );

        const stickyMessage = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = stickyMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            collector.stop();
            if (interaction.customId === 'toggle') {
                serverData.stickyEnabled = !serverData.stickyEnabled;
                await collection.updateOne({ serverId }, { $set: { stickyEnabled: serverData.stickyEnabled } });
                embed.setDescription(`Status: ${serverData.stickyEnabled ? 'Enabled' : 'Disabled'}`);
                await interaction.update({ embeds: [embed], components: [row] });
            } else if (interaction.customId === 'add') {
                embed.setDescription('Please type the sticky message (you have 3 minutes).');
                await interaction.update({ embeds: [embed], components: [] });
                const messageCollector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 180000 });
                messageCollector.on('collect', async (msg) => {
                    messageCollector.stop();
                    embed.setDescription('Please mention the channel to send the sticky message (you have 60 seconds).');
                    await interaction.editReply({ embeds: [embed], components: [] });
                    const channelCollector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 60000 });
                    channelCollector.on('collect', async (channelMsg) => {
                        channelCollector.stop();
                        const channelIdMatch = channelMsg.content.match(/<#(\d+)>/);
                        if (channelIdMatch) {
                            const channelId = channelIdMatch[1];
                            const stickyId = `${serverId}sticky${channelId}`;
                            const existingSticky = serverData.stickyMessages.find(sm => sm.stickyId === stickyId);
                            if (existingSticky) {
                                message.channel.send('A sticky message already exists in this channel. Please delete it first.');
                            } else {
                                serverData.stickyMessages.push({ stickyId, message: msg.content, channelId });
                                await collection.updateOne({ serverId }, { $set: { stickyMessages: serverData.stickyMessages } });
                                const successEmbed = new EmbedBuilder()
                                    .setDescription(`New sticky has been added to <#${channelId}>`)
                                    .setColor(0x00FF00)
                                    .setFooter({ text: 'Aurora bot' })
                                    .setTimestamp();
                                await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
                            }
                        } else {
                            message.channel.send('Invalid channel mention. Please mention a channel like #channel-name.');
                        }
                    });
                    channelCollector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            message.channel.send('Time is up. Use the command again.');
                        }
                    });
                });
                messageCollector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        message.channel.send('Time is up. Use the command again.');
                    }
                });
            } else if (interaction.customId === 'delete') {
                const stickyChannels = serverData.stickyMessages.map(sm => `<#${sm.channelId}>`).join('\n');
                embed.setTitle('Delete Sticky Message')
                    .setDescription(`Please type the channel name to delete the sticky message.\n\nSticky Channels:\n${stickyChannels}`)
                    .setColor(0xFF0000)
                    .setFooter({ text: 'Aurora bot' })
                    .setTimestamp();
                await interaction.update({ embeds: [embed], components: [] });
                const deleteCollector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 60000 });
                deleteCollector.on('collect', async (deleteMsg) => {
                    deleteCollector.stop();
                    const channelIdMatch = deleteMsg.content.match(/<#(\d+)>/);
                    if (channelIdMatch) {
                        const channelId = channelIdMatch[1];
                        const stickyId = `${serverId}sticky${channelId}`;
                        const stickyIndex = serverData.stickyMessages.findIndex(sm => sm.stickyId === stickyId);
                        if (stickyIndex !== -1) {
                            serverData.stickyMessages.splice(stickyIndex, 1);
                            await collection.updateOne({ serverId }, { $set: { stickyMessages: serverData.stickyMessages } });
                            const successEmbed = new EmbedBuilder()
                                .setDescription(`Sticky message has been deleted from <#${channelId}>`)
                                .setColor(0xFF0000)
                                .setFooter({ text: 'Aurora bot' })
                                .setTimestamp();
                            await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
                        } else {
                            message.channel.send('Invalid channel mention. Please mention a channel like #channel-name.');
                        }
                    } else {
                        message.channel.send('Invalid channel mention. Please mention a channel like #channel-name.');
                    }
                });
                deleteCollector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        message.channel.send('Time is up. Use the command again.');
                    }
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.channel.send('Time is up. Use the command again.');
            }
        });
    }
};
