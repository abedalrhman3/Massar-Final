const router = require('express').Router();
const { getAll, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/',             protect, getAll);
router.put('/read-all',     protect, markAllRead); // must be before /:id
router.put('/:id/read',     protect, markRead);

module.exports = router;
