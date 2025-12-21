// middleware/roleMiddleware.js

const isStudentOrTeacher = (req, res, next) => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'teacher')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Requires student or teacher role.' });
  }
};

module.exports = { isStudentOrTeacher };
