const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/questController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',      getAll);
router.get('/:id',   getOne);

router.post('/',     protect, adminOnly, create);
router.put('/:id',   protect, adminOnly, update);
router.delete('/:id',protect, adminOnly, remove);

module.exports = router;
