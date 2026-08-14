const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const accountModel = require('../models/accountModel');
const auditLogModel = require('../models/auditLogModel');
const generateToken = require('../utils/generateToken');
const generateAccountNumber = require('../utils/generateAccountNumber');

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Registers a new user AND opens a default checking account for them in
 * one step, so a freshly registered customer lands on a dashboard that
 * already has something to look at.
 */
const register = async ({ fullName, email, phone, password }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ fullName, email, phone, passwordHash });

  const accountNumber = await generateAccountNumber();
  await accountModel.create({ userId: user.id, accountNumber, accountType: 'checking', balance: 0 });

  const token = generateToken(user);
  return { user, token };
};

/**
 * Authenticates a user by email/password. Tracks failed login attempts
 * and locks the account after MAX_FAILED_ATTEMPTS - a standard banking
 * security control against credential stuffing / brute force.
 */
const login = async ({ email, password, ipAddress }) => {
  const user = await userModel.findByEmail(email);

  if (!user) {
    await auditLogModel.record({ eventType: 'LOGIN_FAILED', ipAddress, details: `Unknown email: ${email}` });
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.status === 'locked') {
    await auditLogModel.record({ userId: user.id, eventType: 'LOGIN_BLOCKED', ipAddress, details: 'Account locked' });
    const err = new Error('This account has been locked due to too many failed login attempts. Please contact support.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    await userModel.incrementFailedLoginAttempts(user.id);
    await auditLogModel.record({ userId: user.id, eventType: 'LOGIN_FAILED', ipAddress, details: 'Incorrect password' });

    if (user.failed_login_attempts + 1 >= MAX_FAILED_ATTEMPTS) {
      const { pool } = require('../config/db');
      await pool.query("UPDATE users SET status = 'locked' WHERE id = ?", [user.id]);
      await auditLogModel.record({ userId: user.id, eventType: 'ACCOUNT_LOCKED', ipAddress, details: 'Too many failed login attempts' });
    }

    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  await userModel.resetFailedLoginAttempts(user.id);
  await auditLogModel.record({ userId: user.id, eventType: 'LOGIN_SUCCESS', ipAddress });

  const token = generateToken(user);
  return { user, token };
};

/** Changes a user's password after verifying their current one. */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await userModel.findByIdWithPassword(userId);

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userModel.updatePassword(userId, newHash);
  await auditLogModel.record({ userId, eventType: 'PASSWORD_CHANGED' });
};

module.exports = { register, login, changePassword };
