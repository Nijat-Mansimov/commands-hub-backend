const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Local strategy for email/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        console.log('[PASSPORT] Authenticating user:', { email });
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
          console.warn('[PASSPORT] User not found:', { email });
          return done(null, false, {
            message: 'Email not found',
          });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          console.warn('[PASSPORT] Password mismatch for user:', { email });
          return done(null, false, {
            message: 'Password is incorrect',
          });
        }

        console.log('[PASSPORT] Authentication successful:', { email, userId: user._id });
        return done(null, user);
      } catch (err) {
        console.error('[PASSPORT] Strategy error:', err.message);
        return done(err);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('[PASSPORT] Deserializing user:', { id });
    const user = await User.findById(id);
    if (user) {
      console.log('[PASSPORT] User deserialized successfully:', { userId: user._id, email: user.email });
    } else {
      console.warn('[PASSPORT] User not found during deserialization:', { id });
    }
    done(null, user);
  } catch (err) {
    console.error('[PASSPORT] Error deserializing user:', err);
    done(err);
  }
});

module.exports = passport;
