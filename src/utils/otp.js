const bcrypt = require('bcryptjs');

const OTP_LENGTH_DEFAULT = 6;
const SALT_ROUNDS = 10;

/**
 * Generate a numeric OTP
 * @param {number} length 
 * @returns {string} OTP
 */
function generateOtp(length = OTP_LENGTH_DEFAULT) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Hash the OTP using bcrypt
 * @param {string} otp 
 * @returns {Promise<string>} hashed OTP
 */
async function hashOtp(otp) {
  const hash = await bcrypt.hash(otp, SALT_ROUNDS);
  return hash;
}

/**
 * Verify OTP against hash
 * @param {string} otp 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
async function verifyOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp
};
