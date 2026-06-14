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
    const { username, is_admin } = req.body;
    if (username && !req.body.name) req.body.name = username;
    if (is_admin !== undefined && !req.body.role) {
      req.body.role = is_admin ? 'admin' : 'user';
    }

    const user = await authService.register(req.body);

    // NOTE: user is NOT logged in automatically until they verify their email.
    // Return a success message instead of a JWT cookie.
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user,
    });
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// GET /api/auth/verify-email/:token
// -------------------------------------------------------
exports.verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// POST /api/auth/forgot-password
// -------------------------------------------------------
exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Always return the same response to prevent email enumeration
    res.json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// POST /api/auth/reset-password/:token
// -------------------------------------------------------
exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.json({ success: true, message: 'Password updated successfully.' });
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
    await UserSession.deleteMany({ userId: user._id });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// PUT /api/auth/users/:id/ban  — admin
// -------------------------------------------------------
exports.toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    if (user._id.toString() === req.user.userId) {
      return next(new AppError('You cannot ban yourself', 400));
    }

    user.isBanned = !user.isBanned;
    await user.save();

    if (user.isBanned) {
      await UserSession.deleteMany({ userId: user._id });
    }

    res.json({
      success: true,
      message: user.isBanned ? 'User has been banned' : 'User ban removed',
      isBanned: user.isBanned,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return next(new AppError('Incorrect current password', 401));

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/upload-avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Please provide an image file', 400));

    // Run strict content safety moderation check
    const { checkPhotoSafety } = require('../services/validateQuestPhotoService');
    console.log(`[AVATAR] Running global safety check for user: ${req.user.userId}`);
    const safetyResult = await checkPhotoSafety(req.file.buffer, req.file.mimetype);
    console.log(`[AVATAR] Safety check result:`, safetyResult);

    if (!safetyResult.is_appropriate) {
      return next(new AppError(`Inappropriate avatar image detected: ${safetyResult.reason}`, 400));
    }

    const { uploadPhoto } = require('../services/uploadService');
    const secureUrl = await uploadPhoto(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { avatar_url: secureUrl } },
      { new: true }
    ).select('-passwordHash');

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};