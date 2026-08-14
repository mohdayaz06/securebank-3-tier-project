const asyncHandler = require('express-async-handler');
const accountService = require('../services/accountService');

const listAccounts = asyncHandler(async (req, res) => {
  const accounts = await accountService.listAccountsForUser(req.user.id);
  res.json({ success: true, count: accounts.length, data: accounts });
});

const getAccount = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountForUser(Number(req.params.id), req.user.id);
  res.json({ success: true, data: account });
});

const openAccount = asyncHandler(async (req, res) => {
  const account = await accountService.openAccount(req.user.id, req.body);
  res.status(201).json({ success: true, data: account });
});

const renameAccount = asyncHandler(async (req, res) => {
  const account = await accountService.renameAccount(Number(req.params.id), req.user.id, req.body.nickname);
  res.json({ success: true, data: account });
});

module.exports = { listAccounts, getAccount, openAccount, renameAccount };
