const router = require('express').Router();
const { getAll, save, remove } = require('../controllers/savedItemController');
const { protect } = require('../middleware/auth');

router.get('/',      protect, getAll);
router.post('/',     protect, save);
router.delete('/:id',protect, remove);

module.exports = router;
