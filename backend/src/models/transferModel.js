const { pool } = require('../config/db');

const insert = async (
  conn,
  { referenceId, fromAccountId, toAccountId, amount, description = null, initiatedByUserId }
) => {
  const [result] = await conn.query(
    `INSERT INTO transfers
       (reference_id, from_account_id, to_account_id, amount, description, initiated_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [referenceId, fromAccountId, toAccountId, amount, description, initiatedByUserId]
  );
  return result.insertId;
};

const findByUserAccounts = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT t.*, fa.account_number AS from_account_number, ta.account_number AS to_account_number
     FROM transfers t
     JOIN accounts fa ON fa.id = t.from_account_id
     JOIN accounts ta ON ta.id = t.to_account_id
     WHERE t.from_account_id IN (SELECT id FROM accounts WHERE user_id = ?)
        OR t.to_account_id IN (SELECT id FROM accounts WHERE user_id = ?)
     ORDER BY t.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, Number(limit), Number(offset)]
  );
  return rows;
};

module.exports = { insert, findByUserAccounts };
