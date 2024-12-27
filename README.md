# 🌌 **Aurora Discord Bot**

Aurora is a versatile Discord bot designed to enhance your server experience with a variety of features. It includes commands for moderation, fun interactions, and utility functions. The bot is built using **Discord.js** and integrates with **MongoDB** for data storage. 

**still under dev so might be lotta issues**

---

## ✨ **Features**

- 🛡️ **Moderation Commands**: Kick, ban, and mute users with ease.
- 🎉 **Fun Interactions**: Engage with users through interactive commands and games.
- 🛠️ **Utility Functions**: Provide useful tools and information to server members.
- ⚙️ **Customizable Roles**: Allow server administrators to set up roles and permissions for commands.

---

## 🛠️ **Setup**

### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/aurora-discord-bot.git
cd aurora-discord-bot
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Configure the Bot**
- Update the `config.js` file in the root directory with your credentials:
  ```javascript
  module.exports = {
      token: 'YOUR_BOT_TOKEN_HERE',
      prefix: '!',
      mongoURI: 'YOUR_MONGO_URI_HERE',
      dbName: 'YOUR_DATABASE_NAME',
      collectionName: 'YOUR_COLLECTION_NAME',
      activity: {
          type: 'PLAYING', // Options: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
          name: 'with your commands!'
      },
      spotify: {
          clientId: 'YOUR_SPOTIFY_CLIENT_ID',  // Needed for song commands
          clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET'
      }
  };
  ```

### 4. **Run the Bot**
```bash
node index.js
```

---

## 🧾 **Usage**

- **Prefix**: Use `!` as the command prefix.
- **Commands**:
  - 🔨 `!kick @user`: Kick a user from the server.
  - 🚫 `!ban @user`: Ban a user from the server.
  - 🔇 `!mute @user 1d`: Mute a user for a specified duration.
  - ⚙️ `!setup`: Configure admin roles for kick, ban, and mute commands.
  - 🎵 `!song @user`: Get a song that describes your compatibility with another user.
  - 💞 `!match @user`: Get a match percentage with another user.

---

## 🤝 **Contributing**

Feel free to contribute to the project by submitting issues, feature requests, or pull requests. Your feedback and contributions are always welcome! 🙌

---

## 📜 **License**

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

---

## 📬 **Contact**

For any questions or support, please open an issue.
