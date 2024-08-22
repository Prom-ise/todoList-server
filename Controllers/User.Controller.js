// const express = require('express');
// const admin = require('../firebaseAdmin');
// const userMode = require("../Models/user.Model");
// const bcrypt = require('bcryptjs');

// // const app = express();
// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
// const secretKey = process.env.SECRET_KEY;

// const authenticateGoogleUser = async (req, res) => {
//   const { displayName, email, photoURL } = req.body;

//   try {
//     let user = await userMode.findOne({ email });

//     if (!user) {
//       // If the user doesn't exist, create a new one
//       user = new userMode({
//         displayName,
//         email,
      
//         isVerified: true, // Google users are already verified
//         googleSignIn: true,
//         photoURL,
//       });
//       await user.save();
//     }

//     // Generate JWT Token
//     const payload = { user: { id: user._id } };
//     jwt.sign(payload, secretKey, { expiresIn: 360000 }, (err, token) => {
//       if (err) throw err;
//       res.json({ token });
//     });
//   } catch (err) {
//     console.error("Google Authentication Error:", err);
//     res.status(500).send("Server error");
//   }
// };

// const sendVerificationEmail = async (email, code) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.PASSWORD,
//     },
//   });

//   const htmlText = `
//     <h1 style="color: blue">Hello Dear User, Your verification code is
//     <div style='font-size: 50px;'>${code}</div></h1>
//   `;

//   const mailOptions = {
//     from: process.env.EMAIL,
//     to: email,
//     subject: "Verify Your Email",
//     html: htmlText,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent');
//   } catch (error) {
//     console.error('Error sending verification email:', error);
//     throw new Error('Email could not be sent');
//   }
// };


// const register = async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;
//   try {
//     let user = await userMode.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }
//     let saltRound = 10;
//     const hashedPassword = bcrypt.hashSync(password, saltRound);
//     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
//     user = new userMode({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       verificationCode, // Save the code in user document
//       isVerified: false // User starts as not verified
//     });
//     await user.save();

//     // Send the verification code via email
//     await sendVerificationEmail(email, verificationCode); // Call your email function

//     res.status(200).json({ msg: "Registration successful! Check your email for the verification code." });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };


// // Modified verifyEmail function to also create the user if the verification code is correct
// const verifyEmail = async (req, res) => {
//   const { email, verificationCode } = req.body;
//   try {
//     const user = await userMode.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'User not found' });
//     }

//     if (user.verificationCode !== verificationCode) {
//       return res.status(400).json({ msg: 'Invalid verification code' });
//     }

//     // Mark user as verified
//     user.isVerified = true;
//     user.verificationCode = undefined; // Clear the verification code
//     await user.save();

//     res.status(200).json({ msg: 'Email verified successfully! You can now log in.' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };


// const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user = await userMode.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

//     const payload = { user: { id: user._id } }; // Ensure the payload uses the correct user ID field
//     jwt.sign(payload, secretKey, { expiresIn: 360000 }, (err, token) => {
//       if (err) throw err;
//       res.json({ token });
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };


// const sendVerificationEmail2 = (to, verificationCode2) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.PASSWORD,
//     }
//  })
//   const htmlText = `
//     <h1 style="color: blue">Hello,</h1>
//     <p>Your verification code is: <strong>${verificationCode2}</strong></p>
//   `;

//   const mailOptions = {
//     from: process.env.EMAIL,
//     to: to,
//     subject: 'Password Reset Verification Code',
//     html: htmlText
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.log('Error sending email:', err);
//     } else {
//       console.log('Email sent:', info.response);
//     }
//   });
// };

// const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await userMode.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Generate a verification code
//     const verificationCode2 = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Set verification code and expiration time
//     user.verificationCode = verificationCode2; // Use verificationCode for consistency
//     user.verificationCodeExpires = Date.now() + 3600000; // 1 hour from now
//     await user.save();

//     // Send the verification code via email
//     sendVerificationEmail2(email, verificationCode2);

//     res.json({ msg: 'Verification code sent to your email.' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// const resetPassword = async (req, res) => {
//   const { email, verificationCode, newPassword } = req.body;

//   try {
//     const user = await userMode.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Check if verification code matches and is not expired
//     if (user.verificationCode !== verificationCode || Date.now() > user.verificationCodeExpires) {
//       return res.status(400).json({ msg: 'Invalid verification code' });
//     }

//     // Code is valid; proceed to reset the password
//     const saltRound = 10;
//     user.password = bcrypt.hashSync(newPassword, saltRound);
//     user.verificationCode = null; // Clear the code after successful verification
//     user.verificationCodeExpires = null; // Clear the expiration
//     await user.save();

//     res.json({ msg: 'Password reset successfully!' });
//   } catch (err) {
//     console.error('Error resetting password:', err.message);
//     res.status(500).send('Server error');
//   }
// };


// const quote = async (req, res) => {
//   try {
//     const response = await fetch('https://zenquotes.io/api/today');
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching quote' });
//   }
// };


// const cors = async (req, res) => {
//   res.json({ message: 'CORS is working!' });
// }


// module.exports = { 
//   authenticateGoogleUser,
//   register, 
//   verifyEmail, 
//   login, 
//   sendVerificationEmail,
//   resetPassword,
//   forgotPassword,
//   quote,
//   cors
//  }



const express = require('express');
const admin = require('../firebaseAdmin');
const userModel = require("../Models/user.Model");
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// const fetch = require('node-fetch'); // Ensure you have this if it's not included in your environment

const secretKey = process.env.SECRET_KEY;

const generateJWT = (userId) => {
  const payload = { user: { id: userId } };
  return jwt.sign(payload, secretKey, { expiresIn: 360000 });
};

const authenticateGoogleUser = async (req, res) => {
  const { displayName, email, photoURL } = req.body;

  try {
    let user = await userModel.findOne({ email });

    if (!user) {
      user = new userModel({
        displayName,
        email,
        isVerified: true, // Google users are already verified
        googleSignIn: true,
        photoURL,
      });
      await user.save();
    }

    const token = generateJWT(user._id);
    res.json({ token });
  } catch (err) {
    console.error("Google Authentication Error:", err);
    res.status(500).send("Server error");
  }
};

const sendEmail = async (email, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const verificationCode = generateVerificationCode();

    user = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
    });
    await user.save();

    const emailContent = `<h1 style="color: blue">Hello Dear User, Your verification code is
                          <div style='font-size: 50px;'>${verificationCode}</div></h1>`;
    await sendEmail(email, "Verify Your Email", emailContent);

    res.status(200).json({ msg: "Registration successful! Check your email for the verification code." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ msg: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateJWT(user._id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const emailContent = `<h1 style="color: blue">Hello,</h1>
                          <p>Your verification code is: <strong>${verificationCode}</strong></p>`;
    await sendEmail(email, 'Password Reset Verification Code', emailContent);

    res.json({ msg: 'Verification code sent to your email.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.verificationCode !== verificationCode || Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ msg: 'Invalid verification code' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ msg: 'Password reset successfully!' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).send('Server error');
  }
};

const quote = async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/today');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ message: 'Error fetching quote' });
  }
};

const cors = async (req, res) => {
  res.json({ message: 'CORS is working!' });
};

module.exports = {
  authenticateGoogleUser,
  register,
  sendEmail,
  verifyEmail,
  login,
  resetPassword,
  forgotPassword,
  quote,
  cors,
};
