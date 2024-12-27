const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');

// Load custom fonts
Canvas.GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/GothamMedium.ttf'), 'Gotham');

// Predestined pairs with their fixed match percentages
const predestinedPairs = new Map([
    ['376580560568582151-1260456461432000574', 100]
    // Format: ['userId1-userId2', percentage]
    // Example: ['123456789-987654321', 100]
]);

function isPredestined(user1Id, user2Id) {
    // Check both combinations as order shouldn't matter
    const pair1 = `${user1Id}-${user2Id}`;
    const pair2 = `${user2Id}-${user1Id}`;
    return predestinedPairs.get(pair1) || predestinedPairs.get(pair2);
}

function addPredestinedPair(user1Id, user2Id, percentage) {
    // Ensure valid percentage
    if (percentage < 0 || percentage > 100) {
        throw new Error('Percentage must be between 0 and 100');
    }
    // Store the pair with sorted IDs to ensure consistent lookup
    const pair = `${user1Id}-${user2Id}`;
    predestinedPairs.set(pair, percentage);
}

function getMatchTitle(percentage) {
    if (percentage === 100) return 'Soulmates! Accept it..';
    if (percentage >= 95) return 'Rab Ne Bana Di Jodi';
    if (percentage >= 90) return 'Destined Partners';
    if (percentage >= 85) return 'A Perfect Pair';
    if (percentage >= 80) return 'Could Be A Good Pair';
    if (percentage >= 75) return 'Dil Ke Kareeb';
    if (percentage >= 70) return 'Secretly Longing';
    if (percentage >= 65) return 'Mutual Admiration';
    if (percentage >= 60) return 'Low-Key Crushes';
    if (percentage >= 55) return 'Slightly Flirty Pals';
    if (percentage >= 50) return 'Friends with Benefits';
    if (percentage >= 45) return 'Potential Friends';
    if (percentage >= 40) return 'Chatty Companions';
    if (percentage >= 35) return 'Padosi Vibes';
    if (percentage >= 30) return 'Budding Friendship';
    if (percentage >= 25) return 'Bas Naam Ke Dost';
    if (percentage >= 20) return 'Tolerable Acquaintances';
    if (percentage >= 15) return 'Anjaan Paraaye';
    if (percentage >= 10) return 'Good Enemies?';
    if (percentage >= 5) return 'Dushman Jani';
    return 'Arch Enemies';
}

function getMatchColor(percentage) {
    if (percentage > 90) return '#50C878'; // Emerald green
    if (percentage >= 30) return '#FF69B4'; // Hot pink
    return '#FF4040'; // Bright red
}

function matchPercentage(user1_id, user2_id) {
    // Check for predestined match first
    const predestinedMatch = isPredestined(user1_id, user2_id);
    if (predestinedMatch !== undefined) {
        return predestinedMatch;
    }

    // If not predestined, calculate normally
    const weight1 = 3;
    const weight2 = 7;
    const constant = 42;

    const combinedValue = (BigInt(user1_id) * BigInt(weight1)) + (BigInt(user2_id) * BigInt(weight2)) + BigInt(constant);
    const percentage = (combinedValue % 100n) + 1n;

    return Number(percentage);
}

async function createMatchImage(message, user1, user2, percentage) {
    try {
        const canvas = Canvas.createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Set background
        ctx.fillStyle = '#23272A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load images
        const avatar1 = await Canvas.loadImage(user1.displayAvatarURL({ extension: 'png', size: 256 }));
        const avatar2 = await Canvas.loadImage(user2.displayAvatarURL({ extension: 'png', size: 256 }));
        const frame = await Canvas.loadImage(path.join(__dirname, '../../assets/frame.png'));

        // Draw circular avatars with more space between them
        const avatarSize = 150;
        const avatar1X = 150;
        const avatar2X = 650;
        const avatarY = 200;

        // First avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatar1X, avatarY, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar1, avatar1X - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
        ctx.restore();

        // Draw frame for first avatar
        const frameSize = avatarSize + 20; // Make frame slightly larger than avatar
        ctx.drawImage(frame, avatar1X - frameSize / 2, avatarY - frameSize / 2, frameSize, frameSize);

        // Second avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatar2X, avatarY, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar2, avatar2X - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
        ctx.restore();

        // Draw frame for second avatar
        ctx.drawImage(frame, avatar2X - frameSize / 2, avatarY - frameSize / 2, frameSize, frameSize);

        // Get the color based on percentage
        const matchColor = getMatchColor(percentage);

        // Draw percentage with Gotham font
        ctx.font = 'bold 70px Gotham';
        ctx.fillStyle = matchColor;
        ctx.textAlign = 'center';
        ctx.fillText(`${percentage}%`, canvas.width / 2, avatarY + 20);

        // Draw progress bar (centered between avatars)
        const barWidth = 300;
        const barHeight = 15;
        const barX = (canvas.width - barWidth) / 2;
        const barY = avatarY + 40;
        const radius = barHeight / 2;

        // Background of progress bar with rounded corners
        ctx.beginPath();
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + barWidth - radius, barY);
        ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
        ctx.lineTo(barX + barWidth, barY + barHeight - radius);
        ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - radius, barY + barHeight);
        ctx.lineTo(barX + radius, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.closePath();
        ctx.fillStyle = '#2C2F33';
        ctx.fill();

        // Filled part of progress bar with rounded corners
        const fillWidth = (barWidth * percentage) / 100;
        ctx.beginPath();
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + fillWidth - radius, barY);
        ctx.quadraticCurveTo(barX + fillWidth, barY, barX + fillWidth, barY + radius);
        ctx.lineTo(barX + fillWidth, barY + barHeight - radius);
        ctx.quadraticCurveTo(barX + fillWidth, barY + barHeight, barX + fillWidth - radius, barY + barHeight);
        ctx.lineTo(barX + radius, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.closePath();
        ctx.fillStyle = matchColor;
        ctx.fill();

        // Draw profile names with Gotham font
        ctx.font = '20px Gotham';
        ctx.fillStyle = '#FFFFFF';
        // Using displayName instead of username for nicknames/profile names
        const member1 = message.guild.members.cache.get(user1.id);
        const member2 = message.guild.members.cache.get(user2.id);
        ctx.fillText(member1?.displayName || user1.username, avatar1X, avatarY + 120);
        ctx.fillText(member2?.displayName || user2.username, avatar2X, avatarY + 120);

        // Add match title at the top
        ctx.font = '60px Gotham';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(getMatchTitle(percentage), canvas.width / 2, 80);

        return canvas.encode('png');
    } catch (error) {
        console.error('Error creating match image:', error);
        throw error;
    }
}

module.exports = {
    name: 'match',
    description: 'Match compatibility with another user.',
    execute: async (client, message, args) => {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('<:aurora_wrong:1322200715598368898> | Please mention a user to match with.');
        }

        if (user.id === message.author.id) {
            return message.reply("<:aurora_wrong:1322200715598368898> | You can't match with yourself!");
        }

        if (user.bot) {
            return message.reply("<:aurora_wrong:1322200715598368898> | You can't match with a bot!");
        }

        try {
            const matchPercent = matchPercentage(message.author.id, user.id);

            // Send initial "Matching..." message
            const initialEmbed = new EmbedBuilder()
                .setTitle('<:aurora_heart:1322196019471056947> Matching...')
                .setColor('#FF69B4') // Hot pink
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            const initialMessage = await message.channel.send({ embeds: [initialEmbed] });

            const imageBuffer = await createMatchImage(message, message.author, user, matchPercent);

            const embed = new EmbedBuilder()
                .setTitle('<:aurora_heart:1322196019471056947> Match Result')
                .setColor(getMatchColor(matchPercent))
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            const attachment = new AttachmentBuilder(imageBuffer, { name: 'match.png' });
            embed.setImage('attachment://match.png');

            // Edit the initial message with the final embed
            await initialMessage.edit({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Error in match command:', error);
            message.reply('Sorry, there was an error generating your love match!');
        }
    }
};
