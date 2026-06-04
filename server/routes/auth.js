const router = require('express').Router();
const { register, login, logout, getMe, getUser, getAllUsers, deleteUser, toggleBanUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// Admin User Management
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id/ban', protect, adminOnly, toggleBanUser);

module.exports = router;