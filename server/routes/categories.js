const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',      getAll);
router.post('/',     protect, adminOnly, create);
router.put('/:id',   protect, adminOnly, update);
router.delete('/:id',protect, adminOnly, remove);

module.exports = router;
