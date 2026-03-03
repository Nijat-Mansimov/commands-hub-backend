const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { username, email, password, passwordConfirm } = req.body;

  try {
    // Check if username already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Check if email already exists
    user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Log the user in after registration
    req.logIn(newUser, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging in after registration',
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: err.message,
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user (handled by passport)
 * @access  Public
 */
exports.login = (req, res) => {
  res.json({
    success: true,
    message: 'Logged in successfully',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
exports.logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out',
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const AttackTemplate = require('../models/AttackTemplate');
    const userTemplates = await AttackTemplate.countDocuments({
      createdBy: req.user._id,
    });
    const publishedTemplates = await AttackTemplate.countDocuments({
      createdBy: req.user._id,
      published: true,
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        stats: {
          totalTemplates: userTemplates,
          publishedTemplates: publishedTemplates,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error loading profile',
      error: err.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.json({
      success: false,
      authenticated: false,
    });
  }

  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
