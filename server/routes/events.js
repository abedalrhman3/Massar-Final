const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/eventController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { fields } = require('../middleware/upload');


const eventUpload = fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images',     maxCount: 10 },
]);


router.get('/',    optionalAuth, getAll);
router.get('/:id', optionalAuth, getOne);


router.post('/',      protect, adminOnly, eventUpload, create);
router.put('/:id',    protect, adminOnly, eventUpload, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
