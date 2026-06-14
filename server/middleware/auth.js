const jwt = require("jsonwebtoken");
const UserSession = require("../models/UserSession");





exports.protect = async (req, res, next) => {
  try {
    
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

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const session = await UserSession.findOne({ token });
    if (!session) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};





exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admins only' });
  }
  next();
};






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
    
    next();
  }
};
