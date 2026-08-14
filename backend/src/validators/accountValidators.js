const { body, param } = require('express-validator');

const createAccountValidator = [
  body('accountType').isIn(['checking', 'savings']).withMessage('Account type must be checking or savings'),
  body('nickname').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Nickname must be 50 characters or fewer'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('openingDeposit').optional().isFloat({ min: 0 }).withMessage('Opening deposit must be a non-negative number'),
];

const renameAccountValidator = [
  body('nickname').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).withMessage('Nickname must be 50 characters or fewer'),
];

const accountIdParamValidator = [param('id').isInt({ min: 1 }).withMessage('Invalid account id')];

module.exports = { createAccountValidator, renameAccountValidator, accountIdParamValidator };
