const crypto = require('crypto');

const generateVerificationCode = () => {
  // Generate a random 6-character code using crypto
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

module.exports = {
  generateVerificationCode
}; 