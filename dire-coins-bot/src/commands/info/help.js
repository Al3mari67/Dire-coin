'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║           Dire Coin's Bot - Help Command                  ║
// ╚══════════════════════════════════════════════════════════╝

const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config');

module.exports = {
  name: 'help',
  aliases: ['h', 'commands', 'cmds'],
  description: 'Display all available Dire Coin commands.',
  usage: '!help',
  category: 'info',

  async execute(message) {
    const { currency, prefix, footer } = config;

    const embed = new EmbedBuilder()
      .setColor(currency.color)
      .setTitle(`${currency.symbol} Dire Coin's — Command Guide`)
      .setDescription(
        `> The official economy system of this server.\n> Use the prefix \`${prefix}\` before each command.`
      )
      .addFields(
        {
          name: '💰 Economy Commands',
          value: [
            `\`${prefix}balance\` / \`${prefix}bal\` — View your wallet`,
            `\`${prefix}balance @user\` — View someone else's wallet`,
            `\`${prefix}pay @user <amount>\` — Transfer coins to a member`,
            `\`${prefix}s @user <amount>\` — Shortcut for pay`,
          ].join('\n'),
          inline: false,
        },
        {
          name: '📋 Amount Shortcuts',
          value: [
            '`1k` = 1,000',
            '`1m` = 1,000,000',
            '`500` = 500 (exact)',
          ].join('  •  '),
          inline: false,
        },
        {
          name: '🔧 System',
          value: `\`${prefix}help\` — Show this menu`,
          inline: false,
        },
        {
          name: '🚀 Coming Soon',
          value: [
            '`Daily Rewards` — Claim free coins every 24h',
            '`Leaderboard` — Top richest members',
            '`Shop` — Spend your Dire Coins',
            '`Gamble` — Risk your coins',
          ].join('\n'),
          inline: false,
        }
      )
      .setFooter({ text: `${footer.icon} ${footer.text} • Use ${prefix}help <command> for details` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
