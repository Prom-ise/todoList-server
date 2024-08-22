const express = require('express');
const admin = require('../firebaseAdmin');
const userModel = require("../Models/user.Model");
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// const fetch = require('node-fetch'); 

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

    const emailContent = `<div style="display: flex; justify-content: center; align-items: center;">
                            <div style="box-sizing: border-box; border: 1px solid white; background-color: black; border-radius: 10px; padding: 10px;">
                            <img src="https://todolist-client-0nr0.onrender.com/assets/todoListLogo-B_pNAm0l.png" alt="TodoList Logo" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 20px;"/>
                            <h1 style="text-align: center">Verify your Email</h1>
                            <div>
                            <h4 style="font-size: 27px">Hello Your code is: <span style="color: cyan; font-weight: 700; font-size: 35px;">${verificationCode}</span> as it will confirm your email for Todo list Application</h4>
                            </div>
                            <h5 style="color: gainsboro; text-align: center; font-size: 18px">The code is valid for <span style="color: white;">20 minutes</span></h5>
                            </div>
                          </div>`;
    await sendEmail(email, `${verificationCode} is your Todo List App Code`, emailContent);

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
      return res.status(400).json({ msg: 'In correct email, check and try again' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'In correct password, check and try again' });
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

    const emailContent = `<div style="display: flex; justify-content: center; align-items: center;">
                          <div style="box-sizing: border-box; border: 1px solid white; background-color: black; border-radius: 10px; padding: 10px;">
                          <img src="https://todolist-client-0nr0.onrender.com/assets/todoListLogo-B_pNAm0l.png" alt="TodoList Logo" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 20px;">
                          <h1 style="text-align: center">Password Reset Verification</h1>
                          <h2 style="color: gainsboro">Hello,</h2>
                          <p style="font-size: 27px">Your verification code to reset your password is: <strong style="color: cyan; font-weight: 700; font-size: 35px;">${verificationCode}</strong></p>
                          <h5 style="color: gainsboro; text-align: center">The code is valid for <span style="color: white;">20 minutes</span></h5>
                          </div>
                          </div>`;
    await sendEmail(email, 'Todo List Application: Password Reset Verification Code', emailContent);

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
