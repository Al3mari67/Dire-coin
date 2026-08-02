'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║          Dire Coin's Bot - Embed Builder Utility          ║
// ╚══════════════════════════════════════════════════════════╝

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

const { currency, footer } = config;

// ── Helpers ────────────────────────────────────────────────

/**
 * Format a number with commas for readability
 */
const fmt = (n) => n.toLocaleString('en-US');

/**
 * Format coin amount with symbol
 */
const coins = (n) => `${currency.symbol} **${fmt(n)}** ${currency.name}`;

/**
 * Get current timestamp
 */
const now = () => Math.floor(Date.now() / 1000);

// ── Base embed factory ─────────────────────────────────────

const baseEmbed = (color) =>
  new EmbedBuilder()
    .setColor(color)
    .setFooter({ text: `${footer.icon} ${footer.text}` })
    .setTimestamp();

// ── Public Builders ────────────────────────────────────────

/**
 * Success transfer embed
 */
const transferSuccess = ({ sender, receiver, amount, senderBalance, receiverBalance }) =>
  baseEmbed(currency.successColor)
    .setTitle(`${currency.symbol} Transfer Successful!`)
    .setDescription(
      `> A transaction has been completed on the **${currency.name}** network.`
    )
    .addFields(
      {
        name: '📤 Sender',
        value: `<@${sender.id}>\n\`${sender.tag}\``,
        inline: true,
      },
      {
        name: '📥 Receiver',
        value: `<@${receiver.id}>\n\`${receiver.tag}\``,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: '💸 Amount Sent',
        value: coins(amount),
        inline: true,
      },
      {
        name: '📊 Sender Balance',
        value: coins(senderBalance),
        inline: true,
      },
      {
        name: '📊 Receiver Balance',
        value: coins(receiverBalance),
        inline: true,
      }
    )
    .setThumbnail('https://i.imgur.com/gold-coin-placeholder.png')
    .setImage(null);

/**
 * Balance display embed
 */
const balanceDisplay = ({ user, balance, totalSent, totalReceived }) =>
  baseEmbed(currency.infoColor)
    .setTitle(`${currency.symbol} Wallet — ${user.tag}`)
    .setDescription(`> Balance overview for <@${user.id}>`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
    .addFields(
      {
        name: '💰 Current Balance',
        value: coins(balance),
        inline: false,
      },
      {
        name: '📤 Total Sent',
        value: coins(totalSent),
        inline: true,
      },
      {
        name: '📥 Total Received',
        value: coins(totalReceived),
        inline: true,
      }
    );

/**
 * Error embed
 */
const error = (title, description) =>
  baseEmbed(currency.errorColor)
    .setTitle(`❌ ${title}`)
    .setDescription(`> ${description}`);

/**
 * Warning embed
 */
const warning = (title, description) =>
  baseEmbed(currency.color)
    .setTitle(`⚠️ ${title}`)
    .setDescription(`> ${description}`);

/**
 * Log embed for audit channel
 */
const transferLog = ({ sender, receiver, amount, guildName, senderBalance }) =>
  baseEmbed(currency.darkColor)
    .setTitle(`📋 Transaction Log`)
    .addFields(
      {
        name: '🏦 Server',
        value: `\`${guildName}\``,
        inline: false,
      },
      {
        name: '📤 From',
        value: `<@${sender.id}> \`(${sender.id})\``,
        inline: true,
      },
      {
        name: '📥 To',
        value: `<@${receiver.id}> \`(${receiver.id})\``,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: '💸 Amount',
        value: coins(amount),
        inline: true,
      },
      {
        name: "📊 Sender's New Balance",
        value: coins(senderBalance),
        inline: true,
      },
      {
        name: '🕐 Time',
        value: `<t:${now()}:F>`,
        inline: true,
      }
    );

/**
 * Cooldown embed
 */
const cooldown = (seconds) =>
  baseEmbed(currency.color)
    .setTitle(`⏳ Slow Down!`)
    .setDescription(
      `> You're sending transactions too fast!\n> Please wait **${seconds}** more second(s).`
    );

module.exports = {
  transferSuccess,
  balanceDisplay,
  transferLog,
  error,
  warning,
  cooldown,
  fmt,
  coins,
};
