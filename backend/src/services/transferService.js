const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const accountModel = require('../models/accountModel');
const transactionModel = require('../models/transactionModel');
const transferModel = require('../models/transferModel');

/**
 * Transfers money between two accounts.
 *
 * Concurrency safety: both accounts are locked with SELECT ... FOR UPDATE
 * inside a single DB transaction, always in a fixed order (lower account id
 * first) to prevent deadlocks when two transfers involving the same pair of
 * accounts run concurrently in opposite directions. Everything - the
 * balance debit, the balance credit, both ledger rows, and the transfer
 * record - commits or rolls back together.
 */
const transferMoney = async (userId, { fromAccountId, toAccountNumber, amount, description }) => {
  const fromAccount = await accountModel.findById(fromAccountId);
  if (!fromAccount || fromAccount.user_id !== userId) {
    const err = new Error('Source account not found');
    err.statusCode = 404;
    throw err;
  }

  const toAccount = await accountModel.findByAccountNumber(toAccountNumber);
  if (!toAccount) {
    const err = new Error('Destination account number was not found');
    err.statusCode = 404;
    throw err;
  }

  if (toAccount.id === fromAccountId) {
    const err = new Error('Cannot transfer to the same account');
    err.statusCode = 422;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Always lock in ascending id order to avoid deadlocks between
    // two transfers that involve the same two accounts in reverse.
    const [firstId, secondId] = [fromAccount.id, toAccount.id].sort((a, b) => a - b);
    const firstLocked = await accountModel.lockForUpdate(conn, firstId);
    const secondLocked = await accountModel.lockForUpdate(conn, secondId);

    const lockedFrom = firstLocked.id === fromAccount.id ? firstLocked : secondLocked;
    const lockedTo = firstLocked.id === toAccount.id ? firstLocked : secondLocked;

    if (lockedFrom.status !== 'active') {
      const err = new Error('Source account is not active');
      err.statusCode = 409;
      throw err;
    }
    if (lockedTo.status !== 'active') {
      const err = new Error('Destination account is not active');
      err.statusCode = 409;
      throw err;
    }
    if (Number(lockedFrom.balance) < Number(amount)) {
      const err = new Error('Insufficient funds for this transfer');
      err.statusCode = 422;
      throw err;
    }

    const referenceId = uuidv4();

    const fromNewBalance = await accountModel.adjustBalance(conn, lockedFrom.id, -amount);
    const toNewBalance = await accountModel.adjustBalance(conn, lockedTo.id, amount);

    await transactionModel.insert(conn, {
      accountId: lockedFrom.id,
      referenceId,
      type: 'transfer_out',
      amount,
      balanceAfter: fromNewBalance,
      relatedAccountId: lockedTo.id,
      description: description || ('Transfer to ' + lockedTo.account_number),
    });

    await transactionModel.insert(conn, {
      accountId: lockedTo.id,
      referenceId,
      type: 'transfer_in',
      amount,
      balanceAfter: toNewBalance,
      relatedAccountId: lockedFrom.id,
      description: description || ('Transfer from ' + lockedFrom.account_number),
    });

    await transferModel.insert(conn, {
      referenceId,
      fromAccountId: lockedFrom.id,
      toAccountId: lockedTo.id,
      amount,
      description,
      initiatedByUserId: userId,
    });

    await conn.commit();

    return {
      referenceId,
      fromAccount: { id: lockedFrom.id, newBalance: fromNewBalance },
      toAccount: { id: lockedTo.id, accountNumber: lockedTo.account_number },
      amount,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getTransfersForUser = async (userId, query) => {
  return transferModel.findByUserAccounts(userId, query);
};

module.exports = { transferMoney, getTransfersForUser };
