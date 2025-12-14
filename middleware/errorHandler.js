// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ errors: messages });
    }
    
    // JWT error
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ errors: ['Invalid token'] });
    }
    
    // Default
    res.status(500).send('Server Error');
  };
  
  module.exports = errorHandler;