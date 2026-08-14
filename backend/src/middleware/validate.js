const { validationResult } = require('express-validator');

/**
 * Runs after an express-validator chain; short-circuits the request with
 * a 400 response listing every validation error instead of letting bad
 * data reach the controller/service layer.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
