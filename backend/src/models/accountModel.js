const { pool } = require('../config/db');

const findAllByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, account_number, account_type, nickname, currency, balance, status, created_at
     FROM accounts WHERE user_id = ? ORDER BY created_at ASC`,
    [userId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const findByAccountNumber = async (accountNumber) => {
  const [rows] = await pool.query(
    'SELECT * FROM accounts WHERE account_number = ? LIMIT 1',
    [accountNumber]
  );
  return rows[0] || null;
};

const belongsToUser = async (accountId, userId) => {
  const [rows] = await pool.query(
    'SELECT id FROM accounts WHERE id = ? AND user_id = ? LIMIT 1',
    [accountId, userId]
  );
  return rows.length > 0;
};

const create = async ({ userId, accountNumber, accountType, nickname = null, currency = 'USD', balance = 0 }) => {
  const [result] = await pool.query(
    `INSERT INTO accounts (user_id, account_number, account_type, nickname, currency, balance)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, accountNumber, accountType, nickname, currency, balance]
  );
  return findById(result.insertId);
};

/** Renames (or clears, if nickname is null/empty) an account's display label. */
const updateNickname = async (id, nickname) => {
  await pool.query('UPDATE accounts SET nickname = ? WHERE id = ?', [nickname || null, id]);
  return findById(id);
};

/**
 * Locks an account row for update within an existing transaction connection.
 * MUST be called with a `conn` obtained from pool.getConnection() that has
 * already started a transaction (conn.beginTransaction()) - this is what
 * prevents two concurrent transfers from double-spending the same balance.
 */
const lockForUpdate = async (conn, accountId) => {
  const [rows] = await conn.query('SELECT * FROM accounts WHERE id = ? FOR UPDATE', [accountId]);
  return rows[0] || null;
};

/**
 * Adjusts a locked account's balance by `delta` (positive = credit,
 * negative = debit) within an existing transaction connection.
 */
const adjustBalance = async (conn, accountId, delta) => {
  await conn.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [delta, accountId]);
  const [rows] = await conn.query('SELECT balance FROM accounts WHERE id = ?', [accountId]);
  return rows[0].balance;
};

module.exports = {
  findAllByUserId,
  findById,
  findByAccountNumber,
  belongsToUser,
  create,
  updateNickname,
  lockForUpdate,
  adjustBalance,
};
