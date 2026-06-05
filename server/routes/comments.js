const router = require('express').Router();
const {
  getAll, create, update, remove,
  toggleLike, toggleDislike,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public (with optional auth so the user's liked/disliked state is included)
router.get('/', optionalAuth, getAll);

// Private — must be logged in
router.post('/', protect, create);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);
router.patch('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
