'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║           Dire Coin's Bot - Ready Event                   ║
// ╚══════════════════════════════════════════════════════════╝

const { ActivityType } = require('discord.js');
const config = require('../config/config');

module.exports = {
  name: 'ready',
  once: true, // Only fires once

  /**
   * @param {import('discord.js').Client} client
   */
  execute(client) {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log(`║   ${config.currency.symbol}  Dire Coin's Bot is Online!           ║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Logged in as: ${client.user.tag.padEnd(28)}║`);
    console.log(`║  Serving ${String(client.guilds.cache.size).padEnd(4)} guild(s)                     ║`);
    console.log(`║  Commands: ${String(client.commands.size).padEnd(4)} loaded                      ║`);
    console.log(`║  Prefix: ${config.prefix.padEnd(5)}                            ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // Set bot status
    client.user.setPresence({
      activities: [
        {
          name: `${config.currency.name} • ${config.prefix}help`,
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    });
  },
};
