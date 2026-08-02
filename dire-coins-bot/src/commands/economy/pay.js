'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║        Dire Coin's Bot - Pay / Transfer Command           ║
// ║               !pay @user <amount>                         ║
// ║               !s   @user <amount>   (shortcut)            ║
// ╚══════════════════════════════════════════════════════════╝

const config = require('../../config/config');
const db = require('../../database/DatabaseManager');
const Embeds = require('../../utils/EmbedBuilder');
const Cooldowns = require('../../utils/CooldownManager');
const { logTransfer } = require('../../utils/Logger');

module.exports = {
  name: 'pay',
  aliases: ['s', 'send', 'transfer'],
  description: 'Transfer Dire Coins to another member.',
  usage: '!pay @user <amount>',
  category: 'economy',

  /**
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   * @param {import('discord.js').Client} client
   */
  async execute(message, args, client) {
    const { author, guild, mentions } = message;

    // ── Cooldown Check ────────────────────────────────────────
    const cd = Cooldowns.check('pay', author.id, config.economy.transferCooldown);
    if (cd.onCooldown) {
      return message.reply({
        embeds: [Embeds.cooldown(cd.remainingSeconds)],
      });
    }

    // ── Argument Validation ───────────────────────────────────
    const target = mentions.members?.first();
    const rawAmount = args[1];

    if (!target || !rawAmount) {
      return message.reply({
        embeds: [
          Embeds.error(
            'Invalid Usage',
            `Correct usage: \`${config.prefix}pay @user <amount>\`\nExample: \`${config.prefix}pay @John 500\``
          ),
        ],
      });
    }

    // ── Bot & Self-Pay Prevention ─────────────────────────────
    if (target.user.bot) {
      return message.reply({
        embeds: [Embeds.error('Invalid Target', "You can't transfer coins to a bot!")],
      });
    }

    if (target.id === author.id) {
      return message.reply({
        embeds: [Embeds.error('Invalid Target', "You can't transfer coins to yourself!")],
      });
    }

    // ── Amount Parsing & Validation ───────────────────────────
    const amount = parseAmount(rawAmount);

    if (amount === null) {
      return message.reply({
        embeds: [
          Embeds.error(
            'Invalid Amount',
            `Please enter a valid whole number.\nExample: \`${config.prefix}pay @user 500\``
          ),
        ],
      });
    }

    if (amount < config.economy.minTransfer) {
      return message.reply({
        embeds: [
          Embeds.error(
            'Amount Too Small',
            `Minimum transfer amount is ${Embeds.coins(config.economy.minTransfer)}`
          ),
        ],
      });
    }

    if (amount > config.economy.maxTransfer) {
      return message.reply({
        embeds: [
          Embeds.error(
            'Amount Too Large',
            `Maximum transfer per transaction is ${Embeds.coins(config.economy.maxTransfer)}`
          ),
        ],
      });
    }

    // ── Execute Transfer ──────────────────────────────────────
    const result = db.transfer(
      author.id,
      target.id,
      guild.id,
      amount,
      author.tag,
      target.user.tag
    );

    if (!result.success) {
      const senderData = db.getOrCreateUser(author.id, guild.id, author.tag);
      return message.reply({
        embeds: [
          Embeds.error(
            'Insufficient Funds',
            `You don't have enough ${config.currency.name}!\n` +
              `Your Balance: ${Embeds.coins(senderData.balance)}\n` +
              `Required: ${Embeds.coins(amount)}`
          ),
        ],
      });
    }

    // ── Set Cooldown ──────────────────────────────────────────
    Cooldowns.set('pay', author.id);

    // ── Success Response ──────────────────────────────────────
    const successEmbed = Embeds.transferSuccess({
      sender: { id: author.id, tag: author.tag },
      receiver: { id: target.id, tag: target.user.tag },
      amount,
      senderBalance: result.senderBalance,
      receiverBalance: result.receiverBalance,
    });

    await message.reply({ embeds: [successEmbed] });

    // ── Log Transaction ───────────────────────────────────────
    await logTransfer(client, {
      sender: { id: author.id, tag: author.tag },
      receiver: { id: target.id, tag: target.user.tag },
      amount,
      guildName: guild.name,
      senderBalance: result.senderBalance,
    });
  },
};

// ── Helper: Parse Amount ───────────────────────────────────

/**
 * Safely parse an amount string to a positive integer.
 * Supports: "500", "1k", "1.5k", "1m"
 * Returns null if invalid.
 */
function parseAmount(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const str = raw.trim().toLowerCase();

  // Shorthand multipliers
  const multipliers = { k: 1_000, m: 1_000_000, b: 1_000_000_000 };
  const match = str.match(/^(\d+(?:\.\d+)?)([kmb]?)$/);

  if (!match) return null;

  let value = parseFloat(match[1]);
  const suffix = match[2];

  if (suffix && multipliers[suffix]) {
    value *= multipliers[suffix];
  }

  // Must be a positive integer within safe bounds
  if (!isFinite(value) || value <= 0 || !Number.isInteger(value)) {
    // Round down if decimal
    value = Math.floor(value);
    if (value <= 0) return null;
  }

  if (value > Number.MAX_SAFE_INTEGER) return null;

  return value;
}
