const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationCode) => {
  console.log(`
    =============== SIMULATED EMAIL ===============
    To: ${email}
    Subject: Password Reset Verification Code
    Message: Your verification code for password reset is: ${verificationCode}
    This code will expire in 10 minutes.
    ============================================
  `);
  
  return Promise.resolve({
    success: true,
    message: 'Verification code simulated successfully'
  });
};

module.exports = { sendVerificationEmail }; 