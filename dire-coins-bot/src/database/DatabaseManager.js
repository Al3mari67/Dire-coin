'use strict';

// ╔══════════════════════════════════════════════════════════╗
// ║           Dire Coin's Bot - Database Manager              ║
// ║         Using better-sqlite3 for sync operations          ║
// ╚══════════════════════════════════════════════════════════╝

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

class DatabaseManager {
  constructor() {
    this.db = null;
    this._init();
  }

  // ── Initialization ─────────────────────────────────────────
  _init() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const dbPath = path.join(dataDir, 'economy.db');
    this.db = new Database(dbPath);

    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this._createTables();
    console.log('[DATABASE] ✅ Database initialized successfully');
  }

  // ── Table Creation ─────────────────────────────────────────
  _createTables() {
    this.db.exec(`
      -- Users / Balances Table
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        guild_id    TEXT NOT NULL,
        username    TEXT NOT NULL,
        balance     INTEGER NOT NULL DEFAULT 0,
        total_sent  INTEGER NOT NULL DEFAULT 0,
        total_received INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at  INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );

      -- Transactions Log Table
      CREATE TABLE IF NOT EXISTS transactions (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id      TEXT NOT NULL,
        sender_id     TEXT NOT NULL,
        receiver_id   TEXT NOT NULL,
        amount        INTEGER NOT NULL,
        note          TEXT,
        created_at    INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );

      -- Indexes for faster queries
      CREATE INDEX IF NOT EXISTS idx_users_guild ON users(guild_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_guild ON transactions(guild_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);
    `);
  }

  // ── User Operations ────────────────────────────────────────

  /**
   * Get or create a user record
   */
  getOrCreateUser(userId, guildId, username) {
    const existing = this.db
      .prepare('SELECT * FROM users WHERE id = ? AND guild_id = ?')
      .get(userId, guildId);

    if (existing) {
      // Update username if changed
      if (existing.username !== username) {
        this.db
          .prepare('UPDATE users SET username = ?, updated_at = strftime(\'%s\', \'now\') WHERE id = ? AND guild_id = ?')
          .run(username, userId, guildId);
        existing.username = username;
      }
      return existing;
    }

    // Create new user with starting balance
    this.db
      .prepare(`
        INSERT INTO users (id, guild_id, username, balance)
        VALUES (?, ?, ?, ?)
      `)
      .run(userId, guildId, username, config.economy.startingBalance);

    return this.db
      .prepare('SELECT * FROM users WHERE id = ? AND guild_id = ?')
      .get(userId, guildId);
  }

  /**
   * Get user balance
   */
  getBalance(userId, guildId) {
    const user = this.db
      .prepare('SELECT balance FROM users WHERE id = ? AND guild_id = ?')
      .get(userId, guildId);
    return user ? user.balance : null;
  }

  /**
   * Transfer coins between users (atomic transaction)
   */
  transfer(senderId, receiverId, guildId, amount, senderName, receiverName) {
    const transferFn = this.db.transaction(() => {
      // Ensure both users exist
      this.getOrCreateUser(senderId, guildId, senderName);
      this.getOrCreateUser(receiverId, guildId, receiverName);

      // Re-fetch sender with lock check
      const sender = this.db
        .prepare('SELECT balance FROM users WHERE id = ? AND guild_id = ?')
        .get(senderId, guildId);

      if (!sender || sender.balance < amount) {
        return { success: false, reason: 'INSUFFICIENT_FUNDS', balance: sender?.balance ?? 0 };
      }

      // Deduct from sender
      this.db
        .prepare(`
          UPDATE users
          SET balance = balance - ?,
              total_sent = total_sent + ?,
              updated_at = strftime('%s', 'now')
          WHERE id = ? AND guild_id = ?
        `)
        .run(amount, amount, senderId, guildId);

      // Add to receiver
      this.db
        .prepare(`
          UPDATE users
          SET balance = balance + ?,
              total_received = total_received + ?,
              updated_at = strftime('%s', 'now')
          WHERE id = ? AND guild_id = ?
        `)
        .run(amount, amount, receiverId, guildId);

      // Log the transaction
      this.db
        .prepare(`
          INSERT INTO transactions (guild_id, sender_id, receiver_id, amount)
          VALUES (?, ?, ?, ?)
        `)
        .run(guildId, senderId, receiverId, amount);

      // Return updated balances
      const newSenderBalance = this.db
        .prepare('SELECT balance FROM users WHERE id = ? AND guild_id = ?')
        .get(senderId, guildId).balance;

      const newReceiverBalance = this.db
        .prepare('SELECT balance FROM users WHERE id = ? AND guild_id = ?')
        .get(receiverId, guildId).balance;

      return {
        success: true,
        senderBalance: newSenderBalance,
        receiverBalance: newReceiverBalance,
      };
    });

    return transferFn();
  }

  /**
   * Get top users by balance (for leaderboard - future use)
   */
  getLeaderboard(guildId, limit = 10) {
    return this.db
      .prepare(`
        SELECT id, username, balance, total_sent, total_received
        FROM users
        WHERE guild_id = ?
        ORDER BY balance DESC
        LIMIT ?
      `)
      .all(guildId, limit);
  }

  /**
   * Get recent transactions for a user
   */
  getTransactionHistory(userId, guildId, limit = 10) {
    return this.db
      .prepare(`
        SELECT * FROM transactions
        WHERE guild_id = ? AND (sender_id = ? OR receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(guildId, userId, userId, limit);
  }

  /**
   * Add balance to a user (admin use - future)
   */
  addBalance(userId, guildId, username, amount) {
    this.getOrCreateUser(userId, guildId, username);
    this.db
      .prepare(`
        UPDATE users
        SET balance = balance + ?,
            updated_at = strftime('%s', 'now')
        WHERE id = ? AND guild_id = ?
      `)
      .run(amount, userId, guildId);
    return this.getBalance(userId, guildId);
  }

  /**
   * Close the database connection gracefully
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('[DATABASE] Database connection closed.');
    }
  }
}

// Singleton instance
module.exports = new DatabaseManager();
