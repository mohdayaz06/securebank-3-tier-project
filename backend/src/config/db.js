const mysql = require('mysql2/promise');

/**
 * A shared connection pool for the whole application.
 * Using a pool (rather than one-off connections) lets Express handle
 * concurrent requests efficiently and is the standard production pattern
 * for mysql2.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  decimalNumbers: true, // return DECIMAL columns as JS numbers instead of strings
});

/**
 * Verifies the database is reachable at startup. Fails fast rather than
 * letting the API come up and silently error on the first request.
 */
const testConnection = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log(`[db] Connected to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  } finally {
    conn.release();
  }
};

module.exports = { pool, testConnection };
