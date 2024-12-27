const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const config = require('../../config.js');

// Load custom fonts
Canvas.GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/GothamMedium.ttf'), 'Gotham');

// Spotify API credentials from config
const clientId = config.spotify.clientId;
const clientSecret = config.spotify.clientSecret;
let accessToken = '';

// Predestined pairs with their fixed match percentages
const predestinedPairs = new Map([
    ['376580560568582151-1061966150285656124', 100]
    // Format: ['userId1-userId2', percentage]
]);

// Function to get Spotify access token
async function getSpotifyAccessToken() {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify({
            grant_type: 'client_credentials'
        })
    };

    try {
        const response = await axios(authOptions);
        accessToken = response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
    }
}

// Function to get song information from Spotify
async function getSongInfo(songName) {
    if (!accessToken) {
        await getSpotifyAccessToken();
    }

    const searchOptions = {
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    try {
        const response = await axios(searchOptions);
        const track = response.data.tracks.items[0];
        return {
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            image: track.album.images[0].url,
            external_urls: track.external_urls
        };
    } catch (error) {
        console.error('Error getting song info:', error);
        return null;
    }
}

// Function to get song title based on percentage
function getSongTitle(percentage) {
    if (percentage === 100) return 'Tujh Mein Rab Dikhta Hai';
    if (percentage >= 95) return 'Tera Ban Jaunga';
    if (percentage >= 90) return 'La Vie En Rose';
    if (percentage >= 85) return 'Jeene Laga Hoon';
    if (percentage >= 80) return 'Tum Hi Ho';
    if (percentage >= 75) return 'Dekha Hazaron Dafaa';
    if (percentage >= 70) return 'Tera Hone Laga Hoon';
    if (percentage >= 65) return 'Tu Hi Hai';
    if (percentage >= 60) return 'Can’t Take My Eyes Off You';
    if (percentage >= 55) return 'Jaane Kyun';
    if (percentage >= 50) return 'I’ll Be There for You';
    if (percentage >= 45) return 'Gallan Goodiyan';
    if (percentage >= 40) return 'Lean On';
    if (percentage >= 35) return 'Pehla Nasha';
    if (percentage >= 30) return 'Dil Chahta Hai';
    if (percentage >= 25) return 'Just a Friend';
    if (percentage >= 20) return 'Kya Mujhe Pyaar Hai';
    if (percentage >= 15) return 'Tera Yaar Hoon Main';
    if (percentage >= 10) return 'Why This Kolaveri Di';
    if (percentage >= 5) return 'Dushman Na Kare';
    return 'Dushman Na Kare';
}

// Function to calculate match percentage
function matchPercentage(user1_id, user2_id) {
    // Define weights for the IDs
    const weight1 = 5;
    const weight2 = 8;
    const constant = 42; // Arbitrary constant for variation

    // Combine the IDs with weights
    const combinedValue = (BigInt(user1_id) * BigInt(weight1)) + (BigInt(user2_id) * BigInt(weight2)) + BigInt(constant);

    // Map the result to a percentage (1 to 100)
    const percentage = (combinedValue % 100n) + 1n; // Using BigInt for large numbers

    return Number(percentage); // Convert back to a regular number
}

// Function to check if a pair is predestined
function isPredestined(user1Id, user2Id) {
    // Check both combinations as order shouldn't matter
    const pair1 = `${user1Id}-${user2Id}`;
    const pair2 = `${user2Id}-${user1Id}`;
    return predestinedPairs.get(pair1) || predestinedPairs.get(pair2);
}

async function createSongImage(title, artist, album, albumCoverUrl, spotifyUrl) {
    const canvas = Canvas.createCanvas(600, 150);
    const context = canvas.getContext('2d');

    // Load and draw album cover
    const albumCover = await Canvas.loadImage(albumCoverUrl);
    context.drawImage(albumCover, 0, 0, 150, 150);

    // Background for text
    context.fillStyle = '#2b2d31';
    context.fillRect(150, 0, 450, 150);

    // Draw song information
    context.font = '24px Gotham';
    context.fillStyle = '#ffffff';
    context.fillText(title.length > 25 ? title.substring(0, 25) + '...' : title, 170, 40);

    context.font = '18px Gotham';
    context.fillStyle = '#b3b3b3';
    context.fillText(artist.length > 30 ? artist.substring(0, 30) + '...' : artist, 170, 70);
    context.fillText(album.length > 30 ? album.substring(0, 30) + '...' : album, 170, 100);

    // Add "Listen" text
    context.font = '16px Gotham';
    context.fillStyle = '#1DB954';  // Spotify green color
    context.fillText('Listen on Spotify', 170, 130);

    return canvas;
}

module.exports = {
    name: 'song',
    description: 'Get a song that describes your compatibility with another user.',
    execute: async (client, message, args) => {
        try {
            if (!args[0]) {
                return message.reply('Please mention another user to get a song match!');
            }

            const user1 = message.author;
            const user2 = message.mentions.users.first();

            if (!user2) {
                return message.reply('<:aurora_wrong:1322200715598368898> | Please mention a valid user!');
            }

            if (user1.id === user2.id) {
                return message.reply('<:aurora_wrong:1322200715598368898> | You cannot match with yourself!');
            }

            // Send initial "Computing..." message
            const initialEmbed = new EmbedBuilder()
                .setTitle('<:aurora_heart:1322196019471056947> Computing...')
                .setColor('#FF69B4') // Hot pink
                .setFooter({ text: 'Aurora bot' })
                .setTimestamp();

            const initialMessage = await message.channel.send({ embeds: [initialEmbed] });

            // Calculate match percentage
            let percentage = matchPercentage(user1.id, user2.id);

            // Check for predestined percentage
            const predestinedPercentage = isPredestined(user1.id, user2.id);
            if (predestinedPercentage !== undefined) {
                percentage = predestinedPercentage;
            }

            // Get song based on percentage
            const songTitle = getSongTitle(percentage);
            const songInfo = await getSongInfo(songTitle);

            if (!songInfo) {
                return message.reply('<:aurora_wrong:1322200715598368898> | Failed to get song information.');
            }

            const canvas = await createSongImage(
                songInfo.name,
                songInfo.artist,
                songInfo.album,
                songInfo.image,
                songInfo.external_urls.spotify
            );

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'song-match.png' });

            const embed = new EmbedBuilder()
                .setColor('#1DB954')
                .setTitle(`<:aurora_heart:1322196019471056947> Song Match Results: ${percentage}% Match!`)
                .setDescription(`Here's a song that describes ${user1}'s compatibility with ${user2}`)
                .setImage('attachment://song-match.png')
                .addFields(
                    { name: 'Listen on Spotify', value: `[Click here](${songInfo.external_urls.spotify})` }
                );

            // Edit the initial message with the final embed
            await initialMessage.edit({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Error in song command:', error);
            message.reply('An error occurred while processing your request.');
        }
    }
};
