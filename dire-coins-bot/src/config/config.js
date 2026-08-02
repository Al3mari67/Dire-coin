'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║              Dire Coin's Bot - Main Config                ║
// ╚══════════════════════════════════════════════════════════╝

require('dotenv').config();

const config = {
  // ── Bot Settings ──────────────────────────────────────────
  token: process.env.BOT_TOKEN,
  prefix: process.env.PREFIX || '!',

  // ── Currency Identity ──────────────────────────────────────
  currency: {
    name: "Dire Coin's",
    symbol: '🪙',
    shortName: 'DC',
    color: 0xF5A623,        // Gold accent color
    successColor: 0x2ECC71, // Green for success
    errorColor: 0xE74C3C,   // Red for errors
    infoColor: 0x3498DB,    // Blue for info
    darkColor: 0x1A1A2E,    // Dark background feel
  },

  // ── Economy Settings ──────────────────────────────────────
  economy: {
    startingBalance: parseInt(process.env.STARTING_BALANCE) || 500,
    minTransfer: parseInt(process.env.MIN_TRANSFER) || 1,
    maxTransfer: parseInt(process.env.MAX_TRANSFER) || 1_000_000,
    transferCooldown: parseInt(process.env.TRANSFER_COOLDOWN) || 5, // seconds
  },

  // ── Channels ──────────────────────────────────────────────
  channels: {
    logs: process.env.LOG_CHANNEL_ID || null,
  },

  // ── Embed Footer ──────────────────────────────────────────
  footer: {
    text: "Dire Coin's Economy System",
    icon: '🪙',
  },
};

// Validate required config
if (!config.token) {
  console.error('[CONFIG] ❌ BOT_TOKEN is missing in .env file!');
  process.exit(1);
}

module.exports = config;
