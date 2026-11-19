const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const github = require('../controllers/githubAuthController');
const email = require('../controllers/emailAuthController');
const {
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', email.signup);
router.post('/verify-email', email.verifyEmail);
router.post('/forgot-password', email.forgotPassword);
router.post('/reset-password', email.resetPassword);
router.post('/login', login);

router.get('/github/status', github.status);
router.get('/github/start', github.start);
router.get('/github/callback', cookieParser(), github.callback);
router.post('/github/exchange', cookieParser(), github.exchange);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/logout', protect, logout);

module.exports = router;

