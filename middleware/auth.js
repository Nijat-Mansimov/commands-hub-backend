// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check if this is an API request using originalUrl (includes /api prefix)
  if (req.originalUrl?.startsWith('/api/') || req.path?.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please log in',
    });
  }
  
  res.redirect('/auth/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.originalUrl?.startsWith('/api/') || req.path?.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Please log in',
      });
    }
    return res.redirect('/auth/login');
  }
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.originalUrl?.startsWith('/api/') || req.path?.startsWith('/api/')) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Admin privileges required',
    });
  }
  
  return res.status(403).render('error', {
    message: 'Access Denied: Admin privileges required',
  });
};

// Middleware to check if user is already authenticated
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  
  // Check if this is an API request
  if (req.originalUrl?.startsWith('/api/') || req.path?.startsWith('/api/')) {
    return res.json({
      success: false,
      message: 'Already authenticated. Redirect to home.',
    });
  }
  
  res.redirect('/templates');
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isNotAuthenticated,
};
