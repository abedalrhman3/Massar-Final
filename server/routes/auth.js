const router = require('express').Router();
const {
    register, login, logout, getMe, getUser, getAllUsers, deleteUser, toggleBanUser,
    updateProfile, updatePassword, uploadAvatar
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── CORRECT MIDDLEWARE PATH ──────────────────────────────────────────────
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Profile Updates
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

// Uses the multer single-upload configuration from your middleware folder
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

// Admin User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id/ban', protect, adminOnly, toggleBanUser);

module.exports = router;