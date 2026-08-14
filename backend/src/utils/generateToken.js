const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for a given user. Payload deliberately carries only the id
 * and role - fresh user data is always re-fetched from the DB on each
 * authenticated request rather than trusted from an old token.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

module.exports = generateToken;
