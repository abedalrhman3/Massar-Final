const authService = require('../services/authService');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// -------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------
exports.register = async (req, res, next) => {
  try {
    // Dynamically bridge differences between Web and Mobile registration payloads
    const { username, is_admin } = req.body;
    if (username && !req.body.name) {
      req.body.name = username; // Map username to name for web compatibility
    }
    if (is_admin !== undefined && !req.body.role) {
      req.body.role = is_admin ? 'admin' : 'user'; // Map boolean to backend role
    }

    const user = await authService.register(req.body);

    // Generate JWT token so they are logged in immediately on mobile/web
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserSession.findOneAndUpdate(
      { userId: user._id },
      { token, expiresAt },
      { upsert: true, new: true }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ success: true, token, user: { ...user, token } });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------
exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, token, user: { ...user, token } });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// POST /api/auth/logout
// -------------------------------------------------------
exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.token);
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// GET /api/auth/me
// -------------------------------------------------------
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id  — admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/users  — admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// DELETE /api/auth/users/:id  — admin
// -------------------------------------------------------
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    // Also delete any active sessions for this user so they are instantly logged out
    const UserSession = require('../models/UserSession');
    await UserSession.deleteMany({ userId: user._id });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// PUT /api/auth/users/:id/ban  — admin
// Toggles the ban status of a user
// -------------------------------------------------------
exports.toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user.userId) {
      return next(new AppError('You cannot ban yourself', 400));
    }

    user.isBanned = !user.isBanned;
    await user.save();

    // If banned, destroy their active sessions so they are instantly logged out
    if (user.isBanned) {
      const UserSession = require('../models/UserSession');
      await UserSession.deleteMany({ userId: user._id });
    }

    res.json({
      success: true,
      message: user.isBanned ? 'User has been banned' : 'User ban removed',
      isBanned: user.isBanned
    });
  } catch (err) {
    next(err);
  }
};
