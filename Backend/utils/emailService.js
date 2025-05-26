const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    // Log the attempt
    console.log(`Attempting to send verification code to: ${email}`);

    // Always log the code in development for debugging
    console.log(`
      =============== VERIFICATION CODE ===============
      To: ${email}
      Code: ${verificationCode}
      ==============================================
    `);

    // Check if we're in development mode or missing email credentials
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Running in development mode or missing email credentials - simulating email send');
      return {
        success: true,
        message: 'Verification code simulated successfully',
        code: verificationCode // Include the code in development
      };
    }

    // Attempt to send real email in production
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Two-Factor Authentication Setup',
      text: `Your verification code is: ${verificationCode}\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Two-Factor Authentication Setup</h2>
          <p style="font-size: 16px; color: #666;">Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2196F3; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'Verification code sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // In development, still return success to allow testing
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - returning success despite error');
      return {
        success: true,
        message: 'Verification code simulated successfully (dev mode)',
        code: verificationCode
      };
    }
    
    throw new Error('Failed to send verification code');
  }
};

module.exports = { sendVerificationEmail }; 