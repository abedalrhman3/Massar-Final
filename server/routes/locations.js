const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/locationController');
const { getByLocation, create: createPost } = require('../controllers/postController');
const { completeTask } = require('../controllers/photoController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() });


router.get('/',    optionalAuth, getAll);
router.get('/:id', getOne);


router.get('/:locationId/posts',  getByLocation);
router.post('/:locationId/posts', protect, upload.single('photo'), createPost);


router.post('/:locationId/complete-task', protect, upload.single('photo'), completeTask);


router.post('/',     protect, adminOnly, create);
router.put('/:id',   protect, adminOnly, update);
router.delete('/:id',protect, adminOnly, remove);

module.exports = router;
