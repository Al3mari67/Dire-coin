'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║          Dire Coin's Bot - Command Handler                ║
// ╚══════════════════════════════════════════════════════════╝

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { log } = require('./Logger');

/**
 * Loads all command files from the commands directory recursively.
 * Each command must export: { name, aliases?, execute(message, args, client) }
 */
function loadCommands(client) {
  const commands = new Collection();
  const aliases = new Collection();

  const commandsPath = path.join(__dirname, '..', 'commands');
  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(folderPath, file));

      if (!command.name || typeof command.execute !== 'function') {
        log('WARN', 'CommandHandler', `Skipping invalid command file: ${file}`);
        continue;
      }

      commands.set(command.name.toLowerCase(), command);

      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          aliases.set(alias.toLowerCase(), command);
        }
      }

      log('INFO', 'CommandHandler', `Loaded command: ${command.name}`);
    }
  }

  client.commands = commands;
  client.aliases = aliases;

  log('INFO', 'CommandHandler', `Total commands loaded: ${commands.size}`);
}

module.exports = { loadCommands };
