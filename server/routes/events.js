const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/eventController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { fields } = require('../middleware/upload');

// Accepts coverImage (1 file) + images (up to 10 files) in one multipart request
const eventUpload = fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images',     maxCount: 10 },
]);

// Public (but admins get to see unpublished items too)
router.get('/',    optionalAuth, getAll);
router.get('/:id', optionalAuth, getOne);

// Admin — eventUpload parses coverImage + images before the controller runs
router.post('/',      protect, adminOnly, eventUpload, create);
router.put('/:id',    protect, adminOnly, eventUpload, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
