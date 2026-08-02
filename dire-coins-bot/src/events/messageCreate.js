'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║         Dire Coin's Bot - messageCreate Event             ║
// ╚══════════════════════════════════════════════════════════╝

const config = require('../config/config');
const Embeds = require('../utils/EmbedBuilder');
const { log } = require('../utils/Logger');

module.exports = {
  name: 'messageCreate',

  /**
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    // ── Guard Clauses ──────────────────────────────────────
    if (message.author.bot) return;
    if (!message.guild) return; // DMs not supported
    if (!message.content.startsWith(config.prefix)) return;

    // ── Parse Input ────────────────────────────────────────
    const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    if (!commandName) return;

    // ── Resolve Command ────────────────────────────────────
    const command =
      client.commands.get(commandName) || client.aliases.get(commandName);

    if (!command) return; // Unknown command — silently ignore

    // ── Permission Check (future-proof hook) ──────────────
    // You can add role/permission checks here

    // ── Execute ────────────────────────────────────────────
    try {
      await command.execute(message, args, client);
      log('INFO', 'MessageCreate', `${message.author.tag} used !${commandName} in #${message.channel.name}`);
    } catch (err) {
      log('ERROR', 'MessageCreate', `Command !${commandName} failed: ${err.message}`);
      console.error(err);

      // Send user-friendly error
      await message.reply({
        embeds: [
          Embeds.error(
            'Unexpected Error',
            'Something went wrong while processing your command. Please try again later.'
          ),
        ],
      }).catch(() => {}); // Prevent double-error crash
    }
  },
};
