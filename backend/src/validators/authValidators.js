const { body } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isLength({ max: 20 }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),
];

module.exports = { registerValidator, loginValidator, changePasswordValidator };
