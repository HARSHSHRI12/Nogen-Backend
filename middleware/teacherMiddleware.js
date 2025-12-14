// middleware/teacherMiddleware.js
const teacherMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied: Teachers only' });
    }
  };
  
  module.exports = teacherMiddleware;
  