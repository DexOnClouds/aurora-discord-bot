const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check bot\'s ping and status',
    execute: async (client, message, args) => {
        const sent = await message.channel.send('Pinging...');
        
        // Get IST time
        const istTime = new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'long'
        });

        const embed = new EmbedBuilder()
            .setTitle('<:aurora_icon:1322195871349215273> Bot Status')
            .addFields(
                { 
                    name: '<:aurora_right:1322200775258144882> Ping', 
                    value: `\`${sent.createdTimestamp - message.createdTimestamp}ms\``,
                    inline: true 
                },
                { 
                    name: '<:aurora_right:1322200775258144882> WebSocket', 
                    value: `\`${client.ws.ping}ms\``,
                    inline: true 
                },
                { 
                    name: '<:aurora_right:1322200775258144882> Servers', 
                    value: `\`${client.guilds.cache.size}\``,
                    inline: true 
                },
                { 
                    name: '<:aurora_right:1322200775258144882> Current Time (IST)', 
                    value: `\`${istTime}\``,
                    inline: false 
                }
            )
            .setColor('#FF69B4')
            .setFooter({ text: 'Aurora bot' })
            .setTimestamp();

        await sent.edit({ content: null, embeds: [embed] });
    }
};
