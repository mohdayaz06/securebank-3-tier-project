const transferMoney = async (
  userId,
  { fromAccountId, toAccountNumber, amount, description }
) => {
  const fromAccount = await accountModel.findById(fromAccountId);

  if (!fromAccount || fromAccount.user_id !== userId) {
    const err = new Error('Source account not found');
    err.statusCode = 404;
    throw err;
  }

  // Destination account is optional.
  // If the 10-digit number exists, this is an internal transfer.
  // If it doesn't exist, treat it as an external recipient.
  const toAccount = await accountModel.findByAccountNumber(toAccountNumber);

  if (toAccount && toAccount.id === fromAccountId) {
    const err = new Error('Cannot transfer to the same account');
    err.statusCode = 422;
    throw err;
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Lock source account first.
    const lockedFrom = await accountModel.lockForUpdate(conn, fromAccount.id);

    if (lockedFrom.status !== 'active') {
      const err = new Error('Source account is not active');
      err.statusCode = 409;
      throw err;
    }

    // Lock destination only when it exists.
    let lockedTo = null;

    if (toAccount) {
      lockedTo = await accountModel.lockForUpdate(conn, toAccount.id);

      if (lockedTo.status !== 'active') {
        const err = new Error('Destination account is not active');
        err.statusCode = 409;
        throw err;
      }
    }

    if (Number(lockedFrom.balance) < Number(amount)) {
      const err = new Error('Insufficient funds for this transfer');
      err.statusCode = 422;
      throw err;
    }

    const referenceId = uuidv4();

    // Always debit the sender.
    const fromNewBalance = await accountModel.adjustBalance(
      conn,
      lockedFrom.id,
      -amount
    );

    // Record sender's transaction.
    await transactionModel.insert(conn, {
      accountId: lockedFrom.id,
      referenceId,
      type: 'transfer_out',
      amount,
      balanceAfter: fromNewBalance,
      relatedAccountId: lockedTo ? lockedTo.id : null,
      description:
        description || ('Transfer to ' + toAccountNumber),
    });

    // If recipient exists, credit the recipient.
    if (lockedTo) {
      const toNewBalance = await accountModel.adjustBalance(
        conn,
        lockedTo.id,
        amount
      );

      await transactionModel.insert(conn, {
        accountId: lockedTo.id,
        referenceId,
        type: 'transfer_in',
        amount,
        balanceAfter: toNewBalance,
        relatedAccountId: lockedFrom.id,
        description:
          description || ('Transfer from ' + lockedFrom.account_number),
      });
    }

    // Store the transfer.
    await transferModel.insert(conn, {
      referenceId,
      fromAccountId: lockedFrom.id,
      toAccountId: lockedTo ? lockedTo.id : null,
      recipientAccountNumber: toAccountNumber,
      amount,
      description,
      initiatedByUserId: userId,
    });

    await conn.commit();

    return {
      referenceId,
      fromAccount: {
        id: lockedFrom.id,
        newBalance: fromNewBalance,
      },
      toAccount: {
        id: lockedTo ? lockedTo.id : null,
        accountNumber: toAccountNumber,
      },
      amount,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
