const accountModel = require('../models/accountModel');
const generateAccountNumber = require('../utils/generateAccountNumber');

const listAccountsForUser = async (userId) => {
  return accountModel.findAllByUserId(userId);
};

const getAccountForUser = async (accountId, userId) => {
  const account = await accountModel.findById(accountId);
  if (!account || account.user_id !== userId) {
    const err = new Error('Account not found');
    err.statusCode = 404;
    throw err;
  }
  return account;
};

const openAccount = async (userId, { accountType, nickname, currency = 'USD', openingDeposit = 0 }) => {
  const accountNumber = await generateAccountNumber();
  return accountModel.create({
    userId,
    accountNumber,
    accountType,
    nickname,
    currency,
    balance: openingDeposit,
  });
};

const renameAccount = async (accountId, userId, nickname) => {
  await getAccountForUser(accountId, userId); // throws 404 if not owned
  return accountModel.updateNickname(accountId, nickname);
};

module.exports = { listAccountsForUser, getAccountForUser, openAccount, renameAccount };
