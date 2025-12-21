const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1️ Get token from cookie (primary)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // 2️ Fallback: Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 3️ No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized – token missing",
      });
    }

    // 4️ Verify access token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 5️ Fetch user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized – user not found",
      });
    }

    // 6️ Attach user
    req.user = user;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = authMiddleware;
