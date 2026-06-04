const router = require('express').Router();
const {
  getAll, getOne, getDetails,
  create, update, updateDetails, remove,
} = require('../controllers/destinationController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { single } = require('../middleware/upload');

// Public (but admins see unpublished items)
router.get('/',             optionalAuth, getAll);
router.get('/:slug',        optionalAuth, getOne);
router.get('/:id/details',  optionalAuth, getDetails);

// Admin — single('image') parses the uploaded image before the controller runs
router.post('/',            protect, adminOnly, single('image'), create);
router.put('/:id',          protect, adminOnly, single('image'), update);
router.put('/:id/details',  protect, adminOnly, updateDetails);
router.delete('/:id',       protect, adminOnly, remove);

module.exports = router;
