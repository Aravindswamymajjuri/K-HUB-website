const nodemailer = require('nodemailer');

// Admin credentials: email => password
const adminCredentials = {
  'aravindswamymajjuri143@gmail.com': 'aravindswamymajjuri143@gmail.com',
  'kadaripavani1@gmail.com': 'kadaripavani1@gmail.com',
  'veerendrarevu@gmail.com' : 'veerendrarevu@gmail.com'
};

let generatedOtps = {}; // Stores OTP per admin email

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aravindswamymajjuri143@gmail.com', // SMTP sender
    pass: 'zpyceoncvjjojvht',
  },
  tls: {
    rejectUnauthorized: false // <-- allows self-signed certs
  }
});

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Admin Login Endpoint
const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  // Check if email exists and password matches
  if (adminCredentials[email] && adminCredentials[email] === password) {
    const otp = generateOtp();
    generatedOtps[email] = otp; // Store OTP per email

    const mailOptions = {
      from: 'aravindswamymajjuri143@gmail.com', // <-- Match transporter user
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).send('Error sending OTP');
      } else {
        return res.status(200).send({ success: true });
      }
    });
  } else {
    return res.status(401).send('Invalid credentials');
  }
};

// OTP Verification Endpoint
const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (
    adminCredentials[email] &&
    generatedOtps[email] &&
    generatedOtps[email] === otp
  ) {
    delete generatedOtps[email]; // Clear OTP after use
    return res.status(200).send({ success: true });
  } else {
    return res.status(401).send('Invalid OTP');
  }
};

module.exports = { loginAdmin, verifyOtp };
