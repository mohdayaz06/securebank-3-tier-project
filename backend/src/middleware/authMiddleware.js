const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const userModel = require('../models/userModel');

/**
 * Requires a valid "Bearer <token>" Authorization header. On success,
 * req.user is set to the current user record (re-fetched from the DB,
 * not trusted from the token payload) for downstream handlers.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user no longer exists');
  }
  if (user.status === 'locked') {
    res.status(403);
    throw new Error('This account has been locked. Please contact support.');
  }

  req.user = user;
  next();
});

/** Restricts a route to specific roles. Must follow `protect`. */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = { protect, authorize };
