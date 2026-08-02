'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║         Dire Coin's Bot - Balance Command                 ║
// ║            !balance / !bal [@user]                        ║
// ╚══════════════════════════════════════════════════════════╝

const db = require('../../database/DatabaseManager');
const Embeds = require('../../utils/EmbedBuilder');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'wallet', 'coins'],
  description: "Check your or another member's Dire Coin's balance.",
  usage: '!balance [@user]',
  category: 'economy',

  /**
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  async execute(message, args) {
    const { author, guild, mentions } = message;

    // Determine target: mentioned user or self
    const targetMember = mentions.members?.first() || message.member;
    const targetUser = targetMember.user;

    // Guard: no bots
    if (targetUser.bot) {
      return message.reply({
        embeds: [Embeds.error('Invalid Target', "Bots don't have wallets!")],
      });
    }

    // Fetch or create user record
    const userData = db.getOrCreateUser(targetUser.id, guild.id, targetUser.tag);

    const embed = Embeds.balanceDisplay({
      user: {
        id: targetUser.id,
        tag: targetUser.tag,
        displayAvatarURL: (opts) => targetUser.displayAvatarURL(opts),
      },
      balance: userData.balance,
      totalSent: userData.total_sent,
      totalReceived: userData.total_received,
    });

    // Add a subtle note if viewing someone else's balance
    if (targetUser.id !== author.id) {
      embed.setDescription(
        `> Balance overview for <@${targetUser.id}> *(requested by <@${author.id}>)*`
      );
    }

    await message.reply({ embeds: [embed] });
  },
};
