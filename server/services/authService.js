const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const AppError = require('../utils/AppError');

// -------------------------------------------------------
// Register a new user
// -------------------------------------------------------
const register = async ({ name, username, email, password, role }) => {
  // Check both email and username uniqueness
  const existing = await User.findOne({
    $or: [
      { email },
      { username: username ? username.trim() : undefined }
    ].filter(q => q.email || q.username)
  });

  if (existing) {
    if (existing.email === email) throw new AppError('Email already in use', 400);
    throw new AppError('Username already in use', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, username, email, passwordHash, role });

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    total_xp: user.total_xp,
    current_level: user.current_level
  };
};

// -------------------------------------------------------
// Login — verify credentials, create JWT, store session
// -------------------------------------------------------
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid email or password', 401);

  if (user.isBanned) {
    throw new AppError('Your account has been banned. Please contact support.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await UserSession.findOneAndUpdate(
    { userId: user._id },
    { token, expiresAt },
    { upsert: true, new: true }
  );

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      total_xp: user.total_xp,
      current_level: user.current_level
    },
  };
};

// -------------------------------------------------------
// Logout — delete session from DB
// -------------------------------------------------------
const logout = async (token) => {
  await UserSession.findOneAndDelete({ token });
};

module.exports = { register, login, logout };
