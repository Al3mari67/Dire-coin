# Dire Coin's Economy Bot 🪙

A professional Discord economy bot with a complete command system built with Discord.js and better-sqlite3.

## ⚠️ SECURITY NOTICE

Your bot token was exposed in the uploaded files. **You MUST regenerate it immediately**:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "Bot" section
4. Click "Regenerate" under the token
5. Copy the new token and update `.env` file

## 📁 Project Structure

```
dire-coins-bot/
├── src/
│   ├── index.js              # Entry point
│   ├── config/
│   │   └── config.js         # Configuration file
│   ├── commands/
│   │   ├── economy/
│   │   │   ├── balance.js    # !balance command
│   │   │   └── pay.js        # !pay command
│   │   └── info/
│   │       └── help.js       # !help command
│   ├── events/
│   │   ├── ready.js          # Bot ready event
│   │   ├── messageCreate.js  # Message handler
│   │   └── guildMemberAdd.js # New member event
│   ├── database/
│   │   └── DatabaseManager.js # SQLite database
│   └── utils/
│       ├── CommandHandler.js  # Command loader
│       ├── EmbedBuilder.js    # Embed templates
│       ├── CooldownManager.js # Cooldown system
│       └── Logger.js          # Logging utility
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Edit `.env` file with your bot settings:
```
BOT_TOKEN=your_bot_token_here
PREFIX=!
LOG_CHANNEL_ID=your_channel_id
STARTING_BALANCE=500
TRANSFER_COOLDOWN=10
MAX_TRANSFER=1000000
MIN_TRANSFER=1
```

### 4. Run the Bot
**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

## 💰 Available Commands

### Economy Commands
- `!balance` / `!bal` - View your wallet
- `!balance @user` - View someone's wallet
- `!pay @user <amount>` - Transfer coins
- `!s @user <amount>` - Shortcut for pay

### Info Commands
- `!help` - Show command guide
- `!help <command>` - Get command details

### Amount Shortcuts
- `1k` = 1,000
- `1m` = 1,000,000
- `500` = exact amount

## 📊 Database

Uses **better-sqlite3** for data storage:
- User balances and transaction history
- Automatic schema creation on first run
- Data stored in `data/economy.db`

## 🔧 Configuration

Edit `src/config/config.js` or `.env`:

```javascript
// Economy settings
startingBalance: 500        // New member balance
minTransfer: 1              // Minimum amount
maxTransfer: 1_000_000      // Maximum amount
transferCooldown: 10        // Seconds between transfers
```

## 🚀 Upcoming Features

- Daily rewards
- Leaderboard system
- Shop/Store
- Gambling mini-game
- Admin commands

## 📝 Error Fixes Applied

### Fixed Issues:
1. **Module not found error** - Corrected directory structure to match `package.json` main entry
2. **Path resolution** - All relative paths now correctly point to `src/` directory
3. **Missing folders** - Created proper command and event directory structure
4. **Config import** - Fixed import paths in all modules

## 🤝 Support

If you encounter issues:
1. Check that all environment variables are set correctly
2. Ensure node_modules are installed (`npm install`)
3. Check console logs for specific error messages
4. Verify database permissions in `data/` folder

## 📄 License

MIT License - See LICENSE file for details

---

**Bot created with ❤️ using Discord.js 14**
