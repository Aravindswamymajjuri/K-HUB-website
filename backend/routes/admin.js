const nodemailer = require('nodemailer');

const predefinedEmail = 'aravindswamymajjuri143@gmail.com';
const predefinedPassword = 'aravindswamymajjuri143@gmail.com';
let generatedOtp = '';

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aravindswamymajjuri143@gmail.com',
    pass: 'zpyceoncvjjojvht',
  },    
});

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const loginAdmin = (req, res) => {
  const { email, password } = req.body;
  if (email === predefinedEmail && password === predefinedPassword) {
    generatedOtp = generateOtp();
    const mailOptions = {
      from: 'pavankolli7532@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${generatedOtp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Error sending OTP');
      } else {
        return res.status(200).send({ success: true });
      }
    });
  } else {
    return res.status(401).send('Invalid credentials');
  }
};

const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  console.log('Received OTP verification attempt:', { email, otp });
  if (email === predefinedEmail && otp === generatedOtp) {
    return res.status(200).send({ success: true });
  } else {
    return res.status(401).send('Invalid OTP');
  }
};

module.exports = { loginAdmin, verifyOtp };
