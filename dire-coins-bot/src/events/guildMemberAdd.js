'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║       Dire Coin's Bot - New Member Registration           ║
// ╚══════════════════════════════════════════════════════════╝

const db = require('../database/DatabaseManager');
const config = require('../config/config');
const { log } = require('../utils/Logger');

module.exports = {
  name: 'guildMemberAdd',

  /**
   * Auto-creates a wallet for new members when they join.
   * @param {import('discord.js').GuildMember} member
   */
  execute(member) {
    try {
      const user = db.getOrCreateUser(member.id, member.guild.id, member.user.tag);
      log(
        'INFO',
        'GuildMemberAdd',
        `New wallet created for ${member.user.tag} with ${config.economy.startingBalance} ${config.currency.name}`
      );
    } catch (err) {
      log('ERROR', 'GuildMemberAdd', `Failed to create wallet for ${member.user.tag}: ${err.message}`);
    }
  },
};
