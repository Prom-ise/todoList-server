const express = require("express");
const router = express.Router();
const { authenticateGoogleUser, login, register, verifyEmail, sendEmail, resetPassword, forgotPassword, quote, cors } = require("../Controllers/User.Controller");
const todoRoutes = require('../Routes/Todo.Route');

router.post('/google-login', authenticateGoogleUser);
router.post("/login", login);
router.post("/register", register);
router.post('/verify-email', verifyEmail);
router.post('/send-email', sendEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/quote', quote);
router.get('/test-cors', cors);

// router.delete('/delete-account', auth, deleteAccount);
router.use('/todos', todoRoutes); // Use todo routes



module.exports = router;