const jwt = require("jsonwebtoken");
const UserSession = require("../models/UserSession");

// -------------------------------------------------------
// protect — verifies JWT and checks session exists in DB
// Use on any route that requires login
// -------------------------------------------------------
exports.protect = async (req, res, next) => {
  try {
    // Get token from cookie first, fall back to Authorization header
    let token = req.cookies.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check session still exists in DB (handles logout)
    const session = await UserSession.findOne({ token });
    if (!session) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    // Attach user info and token to request
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

// -------------------------------------------------------
// adminOnly — blocks non-admin users
// Always use AFTER protect
// -------------------------------------------------------
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admins only' });
  }
  next();
};

// -------------------------------------------------------
// optionalAuth — like protect, but DOES NOT throw errors if no token.
// Just sets req.user if logged in, otherwise leaves it undefined.
// Useful for public routes that act differently for admins.
// -------------------------------------------------------
exports.optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await UserSession.findOne({ token });

    if (session) {
      req.user = decoded;
      req.token = token;
    }
    next();
  } catch (err) {
    // If token is invalid/expired, just proceed as a guest
    next();
  }
};
