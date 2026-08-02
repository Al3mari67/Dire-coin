'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║             Dire Coin's Bot - Logger Utility              ║
// ╚══════════════════════════════════════════════════════════╝

const config = require('../config/config');
const Embeds = require('./EmbedBuilder');

/**
 * Send a transfer log to the configured log channel.
 */
async function logTransfer(client, { sender, receiver, amount, guildName, senderBalance }) {
  const channelId = config.channels.logs;
  if (!channelId) return; // No log channel configured

  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const embed = Embeds.transferLog({ sender, receiver, amount, guildName, senderBalance });
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[LOGGER] Failed to send log embed:', err.message);
  }
}

/**
 * Console log with timestamp and level
 */
function log(level, module, message) {
  const time = new Date().toISOString();
  const levels = { INFO: '✅', WARN: '⚠️', ERROR: '❌', DEBUG: '🔍' };
  console.log(`[${time}] ${levels[level] || '•'} [${module}] ${message}`);
}

module.exports = { logTransfer, log };
