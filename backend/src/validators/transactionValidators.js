const { body } = require('express-validator');

const transferValidator = [
  body('fromAccountId').isInt({ min: 1 }).withMessage('A valid source account is required'),
  body('toAccountNumber')
    .trim()
    .notEmpty()
    .withMessage('Destination account number is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('Destination account number looks invalid'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0')
    .custom((value) => Number(value) <= 1000000)
    .withMessage('Amount exceeds the maximum allowed per transfer'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 255 }),
];

const depositValidator = [
  body('accountId').isInt({ min: 1 }).withMessage('A valid account is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 255 }),
];

const withdrawalValidator = [
  body('accountId').isInt({ min: 1 }).withMessage('A valid account is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 255 }),
];

module.exports = { transferValidator, depositValidator, withdrawalValidator };
