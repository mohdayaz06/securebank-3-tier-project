const { pool } = require('../config/db');

/**
 * All functions here are thin wrappers around parameterized SQL queries.
 * No business logic lives in this layer - that belongs in services/.
 */

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/** Includes password_hash - only for internal use (e.g. verifying current password). */
const findByIdWithPassword = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const create = async ({ fullName, email, phone, passwordHash }) => {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?)`,
    [fullName, email, phone || null, passwordHash]
  );
  return findById(result.insertId);
};

const updateProfile = async (id, { fullName, phone }) => {
  await pool.query(
    'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
    [fullName, phone || null, id]
  );
  return findById(id);
};

const updatePassword = async (id, passwordHash) => {
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
};

const incrementFailedLoginAttempts = async (id) => {
  await pool.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [id]);
};

const resetFailedLoginAttempts = async (id) => {
  await pool.query('UPDATE users SET failed_login_attempts = 0 WHERE id = ?', [id]);
};

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  updateProfile,
  updatePassword,
  incrementFailedLoginAttempts,
  resetFailedLoginAttempts,
};
