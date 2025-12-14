const jwt = require('jsonwebtoken');

// Middleware to check the JWT token
const jwtAuthMiddleware = (req, res, next) => {
  // First, check if authorization header exists
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: 'Invalid Token..' });
  }

  // Extract JWT token from authorization header
  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: 'Invalid Token!!' });
  }
};

// Function to generate a new JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' }); // Set expiration as needed
}

module.exports = { jwtAuthMiddleware, generateToken };
