const router = require('express').Router();
const { getAll, getOne, create, update, remove, joinQuest } = require('../controllers/questController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/:id/join', protect, upload.single('photo'), joinQuest);

router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, remove);

module.exports = router;