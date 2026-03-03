const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { isNotAuthenticated, isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for registration
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', isNotAuthenticated, validateRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with passport
 * @access  Public
 */
router.post('/login', isNotAuthenticated, (req, res, next) => {
  console.log('[AUTH] Login attempt:', { email: req.body.email });
  
  passport.authenticate('local', (err, user, info) => {
    console.log('[AUTH] Passport callback:', { err: err?.message, userFound: !!user, info });
    
    if (err) {
      console.error('[AUTH] Authentication error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error during authentication',
        error: err.message,
      });
    }

    if (!user) {
      console.warn('[AUTH] Authentication failed - invalid credentials');
      return res.status(401).json({
        success: false,
        message: info?.message || 'Invalid credentials',
      });
    }

    console.log('[AUTH] Authentication successful, logging in user:', user._id);
    req.logIn(user, (err) => {
      if (err) {
        console.error('[AUTH] Session error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error establishing session',
        });
      }

      console.log('[AUTH] Login successful, session established:', { userId: user._id, email: user.email });
      res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', isAuthenticated, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile with stats
 * @access  Private
 */
router.get('/profile', isAuthenticated, authController.getProfile);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authController.getCurrentUser);

module.exports = router;
