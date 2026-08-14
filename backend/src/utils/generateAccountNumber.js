const { pool } = require('../config/db');

/**
 * Generates a random 10-digit account number and verifies it isn't already
 * in use. Collisions are astronomically unlikely but we check anyway since
 * account_number has a UNIQUE constraint and this keeps retries graceful
 * instead of surfacing a raw DB error to the caller.
 */
const generateAccountNumber = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = String(Math.floor(1000000000 + Math.random() * 9000000000));
    const [rows] = await pool.query('SELECT id FROM accounts WHERE account_number = ?', [candidate]);
    if (rows.length === 0) return candidate;
  }
  throw new Error('Failed to generate a unique account number, please try again');
};

module.exports = generateAccountNumber;
