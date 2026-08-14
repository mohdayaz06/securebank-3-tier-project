const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const accountModel = require('../models/accountModel');
const transactionModel = require('../models/transactionModel');

const getHistoryForAccount = async (accountId, userId, query) => {
  const owns = await accountModel.belongsToUser(accountId, userId);
  if (!owns) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }
  return transactionModel.findByAccountId(accountId, query);
};

/**
 * Deposits funds into an account. Wrapped in a DB transaction so the
 * balance update and the ledger row are always written together - if
 * either fails, both are rolled back.
 */
const deposit = async (userId, { accountId, amount, description }) => {
  const owns = await accountModel.belongsToUser(accountId, userId);
  if (!owns) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const account = await accountModel.lockForUpdate(conn, accountId);
    if (account.status !== 'active') {
      const err = new Error('This account is not active');
      err.statusCode = 409;
      throw err;
    }

    const newBalance = await accountModel.adjustBalance(conn, accountId, amount);
    const referenceId = uuidv4();
    await transactionModel.insert(conn, {
      accountId,
      referenceId,
      type: 'deposit',
      amount,
      balanceAfter: newBalance,
      description: description || 'Deposit',
    });

    await conn.commit();
    return { referenceId, newBalance };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Withdraws funds from an account, rejecting the request (before writing
 * anything) if it would overdraw the account.
 */
const withdraw = async (userId, { accountId, amount, description }) => {
  const owns = await accountModel.belongsToUser(accountId, userId);
  if (!owns) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const account = await accountModel.lockForUpdate(conn, accountId);
    if (account.status !== 'active') {
      const err = new Error('This account is not active');
      err.statusCode = 409;
      throw err;
    }
    if (Number(account.balance) < Number(amount)) {
      const err = new Error('Insufficient funds for this withdrawal');
      err.statusCode = 422;
      throw err;
    }

    const newBalance = await accountModel.adjustBalance(conn, accountId, -amount);
    const referenceId = uuidv4();
    await transactionModel.insert(conn, {
      accountId,
      referenceId,
      type: 'withdrawal',
      amount,
      balanceAfter: newBalance,
      description: description || 'Withdrawal',
    });

    await conn.commit();
    return { referenceId, newBalance };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { getHistoryForAccount, deposit, withdraw };
