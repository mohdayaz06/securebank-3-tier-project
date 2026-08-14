const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  changePassword,
  updateProfile,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Stricter rate limit on auth endpoints to slow down credential stuffing /
// brute-force attempts beyond the account-lock logic in authService.
const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordValidator, validate, changePassword);
router.put('/profile', protect, updateProfile);

module.exports = router;
