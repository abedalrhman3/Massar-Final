const router = require('express').Router();
const {
  getAll, getOne, getDetails,
  create, update, updateDetails, remove,
} = require('../controllers/destinationController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { single } = require('../middleware/upload');

// Public (but admins see unpublished items)
router.get('/', optionalAuth, getAll);

// Crucial: The literal text '/details' MUST come before the dynamic parameter ':id'
router.get('/details/:id', optionalAuth, getDetails);
router.get('/:slug', optionalAuth, getOne);

// Admin
router.post('/', protect, adminOnly, single('image'), create);
router.put('/:id', protect, adminOnly, single('image'), update);
router.put('/details/:id', protect, adminOnly, updateDetails); // Match here too
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;