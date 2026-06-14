const authService = require('../services/authService');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');




exports.register = async (req, res, next) => {
  try {
    const { username, is_admin } = req.body;
    if (username && !req.body.name) req.body.name = username;
    if (is_admin !== undefined && !req.body.role) {
      req.body.role = is_admin ? 'admin' : 'user';
    }

    const user = await authService.register(req.body);

    
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user,
    });
  } catch (err) {
    next(err);
  }
};




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




exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.token);
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};




exports.verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};




exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    
    res.json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};




exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};




exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};


exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};


exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};




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


exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Please provide an image file', 400));

    
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