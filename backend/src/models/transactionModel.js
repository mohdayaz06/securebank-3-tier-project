const { pool } = require('../config/db');

const findByAccountId = async (accountId, { page = 1, limit = 20, type, search } = {}) => {
  const offset = (page - 1) * limit;
  const params = [accountId];
  let filterSql = '';

  if (type) {
    filterSql += ' AND type = ?';
    params.push(type);
  }
  if (search) {
    filterSql += ' AND description LIKE ?';
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(
    `SELECT id, account_id, reference_id, type, amount, balance_after,
            related_account_id, description, status, created_at
     FROM transactions
     WHERE account_id = ?${filterSql}
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM transactions WHERE account_id = ?${filterSql}`,
    params
  );

  return { rows, total: countRows[0].total };
};

const findById = async (id, accountId) => {
  const [rows] = await pool.query(
    'SELECT * FROM transactions WHERE id = ? AND account_id = ? LIMIT 1',
    [id, accountId]
  );
  return rows[0] || null;
};

/**
 * Inserts a ledger row within an existing transaction connection.
 * Used for deposits, withdrawals, and each leg of a transfer.
 */
const insert = async (
  conn,
  { accountId, referenceId, type, amount, balanceAfter, relatedAccountId = null, description = null }
) => {
  const [result] = await conn.query(
    `INSERT INTO transactions
       (account_id, reference_id, type, amount, balance_after, related_account_id, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [accountId, referenceId, type, amount, balanceAfter, relatedAccountId, description]
  );
  return result.insertId;
};

module.exports = { findByAccountId, findById, insert };
