const router = require('express').Router();
const { register, login, logout, getMe, getUser, getAllUsers, deleteUser, toggleBanUser, updateProfile, updatePassword, uploadAvatar } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// ---------- Google OAuth ----------
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  async (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update or create user session (similar to login controller)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const UserSession = require('../models/UserSession');
    await UserSession.findOneAndUpdate(
      { userId: req.user._id },
      { token, expiresAt },
      { upsert: true, new: true }
    );

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to application page after successful login
    res.redirect(`${process.env.CLIENT_URL}/`);
  });

// ---------- Local Auth ----------
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Profile updates
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

// Admin user management
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id/ban', protect, adminOnly, toggleBanUser);

module.exports = router;