const asyncHandler = require('express-async-handler');
const transactionService = require('../services/transactionService');

const getHistory = asyncHandler(async (req, res) => {
  const accountId = Number(req.params.accountId);
  const { page = 1, limit = 20, type, search } = req.query;

  const { rows, total } = await transactionService.getHistoryForAccount(accountId, req.user.id, {
    page: Number(page),
    limit: Number(limit),
    type,
    search,
  });

  res.json({
    success: true,
    count: rows.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: rows,
  });
});

const deposit = asyncHandler(async (req, res) => {
  const result = await transactionService.deposit(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Deposit completed', data: result });
});

const withdraw = asyncHandler(async (req, res) => {
  const result = await transactionService.withdraw(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Withdrawal completed', data: result });
});

module.exports = { getHistory, deposit, withdraw };
