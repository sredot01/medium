const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Secret (in production, use environment variable)
const getJwtSecret = () => process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = '30d';

// Generate JWT Token
const generateToken = (userId) => {
  const sessionVersion = User.findById(userId)?.sessionVersion ?? 0;
  return jwt.sign({ id: userId, sessionVersion }, getJwtSecret(), { expiresIn: JWT_EXPIRE });
};

exports.generateToken = generateToken;

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user.id);
    const safeUser = User.getSafeUser(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res) => {
  const safeUser = User.getSafeUser(req.user);
  
  res.json({
    success: true,
    data: safeUser,
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, bio, avatar } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    const updatedUser = await User.update(req.user.id, { name, email, bio, avatar });
    const safeUser = User.getSafeUser(updatedUser);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    // Verify current password
    const isPasswordValid = await User.verifyPassword(currentPassword, req.user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    await User.update(req.user.id, { password: newPassword });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  // For JWT, logout is handled on the client side by removing the token
  res.json({
    success: true,
    message: 'Logout successful',
  });
};
