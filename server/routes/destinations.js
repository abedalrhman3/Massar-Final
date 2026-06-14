const router = require('express').Router();
const {
  getAll, getOne, getDetails,
  create, update, updateDetails, remove,
  toggleLike
} = require('../controllers/destinationController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { single } = require('../middleware/upload');


router.get('/', optionalAuth, getAll);


router.get('/details/:id', optionalAuth, getDetails);
router.get('/:slug', optionalAuth, getOne);


router.post('/:id/like', protect, toggleLike);


router.post('/', protect, adminOnly, single('image'), create);


router.put('/details/:id', protect, adminOnly, updateDetails);
router.put('/:id', protect, adminOnly, single('image'), update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;