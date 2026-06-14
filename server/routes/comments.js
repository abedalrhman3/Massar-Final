const router = require('express').Router();
const {
  getAll, create, update, remove,
  toggleLike, toggleDislike,
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');


router.get('/', optionalAuth, getAll);


router.post('/', protect, create);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);
router.patch('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
