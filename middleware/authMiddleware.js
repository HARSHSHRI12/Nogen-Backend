const jwt = require('jsonwebtoken');
const User = require('../models/user');


module.exports = async (req, res, next) => {
  // Get token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Check if token is provided
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    // Verify the JWT token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user by decoded id, exclude password from the response
    const user = await User.findById(decoded.id).select('-password');
    
    // If user is not found, token is invalid
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token or user not found' });
    }

    // Attach the user object to the request object for future use in the route handler
    req.user = user;
    
    // Continue with the next middleware or route handler
    next();
  } catch (err) {
    console.error('JWT verification error:', err);  // Log error for debugging
    
    // If token is expired or invalid, send error response
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired, please login again' });
    }
    
    // General error for invalid or unauthorized token
    return res.status(401).json({ success: false, error: 'Unauthorized, invalid token' });
  }
};
