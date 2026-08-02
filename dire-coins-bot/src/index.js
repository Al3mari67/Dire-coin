'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║              Dire Coin's Bot - Entry Point                ║
// ║           Professional Discord Economy System             ║
// ╚══════════════════════════════════════════════════════════╝

require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');
const { loadCommands } = require('./utils/CommandHandler');
const { log } = require('./utils/Logger');

// ── Client Setup ───────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: false, // Prevent double-ping on reply
  },
});

// ── Collections ────────────────────────────────────────────
client.commands = new Collection();
client.aliases = new Collection();

// ── Load Commands ──────────────────────────────────────────
loadCommands(client);

// ── Load Events ────────────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }

  log('INFO', 'Events', `Registered event: ${event.name}`);
}

// ── Global Error Handlers ──────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  log('ERROR', 'Process', `Unhandled Rejection: ${reason}`);
  console.error('Unhandled Promise Rejection:', promise);
});

process.on('uncaughtException', (err) => {
  log('ERROR', 'Process', `Uncaught Exception: ${err.message}`);
  console.error(err);
});

// ── Graceful Shutdown ──────────────────────────────────────
const db = require('./database/DatabaseManager');

process.on('SIGINT', () => {
  log('INFO', 'Process', 'Received SIGINT. Shutting down gracefully...');
  db.close();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('INFO', 'Process', 'Received SIGTERM. Shutting down gracefully...');
  db.close();
  client.destroy();
  process.exit(0);
});

// ── Login ──────────────────────────────────────────────────
client.login(config.token).catch((err) => {
  log('ERROR', 'Login', `Failed to login: ${err.message}`);
  process.exit(1);
});
