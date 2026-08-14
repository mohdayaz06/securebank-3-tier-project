const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const userModel = require('../models/userModel');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const ipAddress = req.ip;
  const { user, token } = await authService.login({ ...req.body, ipAddress });
  res.json({
    success: true,
    data: {
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
      token,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.json({ success: true, message: 'Password updated successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const updated = await userModel.updateProfile(req.user.id, { fullName, phone });
  res.json({ success: true, data: updated });
});

module.exports = { register, login, getMe, changePassword, updateProfile };
