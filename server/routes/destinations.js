const router = require('express').Router();
const {
  getAll, getOne, getDetails,
  create, update, updateDetails, remove,
  toggleLike
} = require('../controllers/destinationController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { single } = require('../middleware/upload');

// Public (but admins see unpublished items)
router.get('/', optionalAuth, getAll);

// Crucial: The literal text '/details' MUST come before the dynamic parameter ':id'
router.get('/details/:id', optionalAuth, getDetails);
router.get('/:slug', optionalAuth, getOne);

// Authenticated
router.post('/:id/like', protect, toggleLike);

// Admin
router.post('/', protect, adminOnly, single('image'), create);
// IMPORTANT: literal /details/:id MUST come before dynamic /:id so Express doesn't
// capture "details" as the :id param and swallow the updateDetails route.
router.put('/details/:id', protect, adminOnly, updateDetails);
router.put('/:id', protect, adminOnly, single('image'), update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;