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
// Add these exports at the bottom of your authController.js file

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
    // 1. Ensure multer parsed the file stream from the frontend request successfully[cite: 3]
    if (!req.file) {
      return next(new AppError('Please provide an image file', 400));
    }

    // 2. CORRECT SERVICE PATH: Pull the Cloudinary upload execution function[cite: 5]
    const { uploadPhoto } = require('../services/uploadService');

    // Pass the memory buffer directly to Cloudinary[cite: 3, 5]
    const secureUrl = await uploadPhoto(req.file.buffer);

    // 3. Save the returned Cloudinary URL string into MongoDB
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