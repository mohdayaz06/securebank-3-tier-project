const asyncHandler = require('express-async-handler');
const transferService = require('../services/transferService');

const transferMoney = asyncHandler(async (req, res) => {
  const result = await transferService.transferMoney(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Transfer completed', data: result });
});

const listTransfers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const transfers = await transferService.getTransfersForUser(req.user.id, { page: Number(page), limit: Number(limit) });
  res.json({ success: true, count: transfers.length, data: transfers });
});

module.exports = { transferMoney, listTransfers };
