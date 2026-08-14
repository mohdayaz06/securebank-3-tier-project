const { pool } = require('../config/db');

/**
 * Fire-and-forget style logger for security events (login success/failure,
 * password changes, etc). Failures to write an audit log are logged to the
 * console but never block the request that triggered them.
 */
const record = async ({ userId = null, eventType, ipAddress = null, details = null }) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, event_type, ip_address, details) VALUES (?, ?, ?, ?)',
      [userId, eventType, ipAddress, details]
    );
  } catch (err) {
    console.error(`[audit] Failed to record event "${eventType}": ${err.message}`);
  }
};

module.exports = { record };
