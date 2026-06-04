const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/locationController');
const { getByLocation, create: createPost } = require('../controllers/postController');
const { completeTask } = require('../controllers/photoController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

// Use memory storage so we can pass buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Public
router.get('/',    getAll);
router.get('/:id', getOne);

// Community posts per location
router.get('/:locationId/posts',  getByLocation);
router.post('/:locationId/posts', protect, createPost);

// Complete task at a location (with optional photo upload)
router.post('/:locationId/complete-task', protect, upload.single('photo'), completeTask);

// Admin
router.post('/',     protect, adminOnly, create);
router.put('/:id',   protect, adminOnly, update);
router.delete('/:id',protect, adminOnly, remove);

module.exports = router;
