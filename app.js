require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/database');
require('./config/passport');

const app = express();

// Initialize server with database connection
(async () => {
  try {
    // Connect to MongoDB FIRST (this is async)
    await connectDB();

    // Middleware
    const corsOptions = {
      origin: function (origin, callback) {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:8080',
          'https://commandshub.onrender.com',
          ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [])
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Trust proxy - important for production
    app.set('trust proxy', 1);

    // Session middleware - MUST come before routes and passport
    const sessionConfig = {
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false, // Don't save session if unmodified
      saveUninitialized: false, // Don't save uninitialized sessions
      name: 'sessionId', // Custom session cookie name
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/commands-hub',
        touchAfter: 24 * 3600 // Lazy session update (24 hours)
      }),
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies only in production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'lax' in development, 'none' in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/', // Ensure cookie is available for all paths
      },
    };

    // In production with https, ensure sameSite: 'none' works with secure: true
    if (process.env.NODE_ENV === 'production' && process.env.SECURE_COOKIES !== 'false') {
      sessionConfig.cookie.secure = true;
      sessionConfig.cookie.sameSite = 'none';
    }

    app.use(session(sessionConfig));

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Debug middleware - log session info
    app.use((req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SESSION] ${req.method} ${req.path} - Authenticated: ${req.isAuthenticated()}, User: ${req.user?._id}`);
      }
      next();
    });

    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/templates', require('./routes/templates'));

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        authenticated: req.isAuthenticated(),
      });
    });

    // Home endpoint
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Attack Command Repository API',
        version: '1.0.0',
        endpoints: {
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            logout: 'POST /api/auth/logout',
            profile: 'GET /api/auth/profile',
            currentUser: 'GET /api/auth/me',
          },
          templates: {
            list: 'GET /api/templates',
            create: 'POST /api/templates',
            getOne: 'GET /api/templates/:id',
            update: 'PUT /api/templates/:id',
            delete: 'DELETE /api/templates/:id',
            generate: 'POST /api/templates/:id/generate',
            publicStats: 'GET /api/templates/stats/public',
            categories: 'GET /api/templates/categories/list',
            admin: {
              listAll: 'GET /api/admin/templates',
              approve: 'POST /api/admin/templates/:id/approve',
              reject: 'POST /api/admin/templates/:id/reject',
              stats: 'GET /api/admin/stats',
            },
          },
        },
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path,
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);

      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
      });
    });

    const PORT = process.env.PORT || 3000;
    const NODE_ENV = process.env.NODE_ENV || 'development';

    // Start server after database is connected
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║  Attack Command Repository API             ║
║  Running on http://localhost:${PORT}                  ║
║  Environment: ${NODE_ENV.toUpperCase()}                  ║
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

module.exports = app;
