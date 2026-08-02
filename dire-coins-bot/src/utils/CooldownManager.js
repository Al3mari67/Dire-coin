'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║          Dire Coin's Bot - Cooldown Manager               ║
// ╚══════════════════════════════════════════════════════════╝

/**
 * In-memory cooldown tracker per command per user.
 * Each entry: Map<userId, timestamp>
 */
class CooldownManager {
  constructor() {
    /** @type {Map<string, Map<string, number>>} */
    this._store = new Map();
  }

  /**
   * Check if a user is on cooldown for a command.
   * @param {string} commandName
   * @param {string} userId
   * @param {number} cooldownSeconds
   * @returns {{ onCooldown: boolean, remainingSeconds: number }}
   */
  check(commandName, userId, cooldownSeconds) {
    if (!this._store.has(commandName)) {
      this._store.set(commandName, new Map());
    }

    const timestamps = this._store.get(commandName);
    const now = Date.now();
    const cooldownMs = cooldownSeconds * 1000;

    if (timestamps.has(userId)) {
      const expiresAt = timestamps.get(userId) + cooldownMs;
      if (now < expiresAt) {
        const remaining = Math.ceil((expiresAt - now) / 1000);
        return { onCooldown: true, remainingSeconds: remaining };
      }
    }

    return { onCooldown: false, remainingSeconds: 0 };
  }

  /**
   * Set cooldown for a user on a command (call after executing the command).
   * @param {string} commandName
   * @param {string} userId
   */
  set(commandName, userId) {
    if (!this._store.has(commandName)) {
      this._store.set(commandName, new Map());
    }
    this._store.get(commandName).set(userId, Date.now());
  }

  /**
   * Clear a user's cooldown (admin use).
   */
  clear(commandName, userId) {
    this._store.get(commandName)?.delete(userId);
  }
}

module.exports = new CooldownManager();
