const router = require('express').Router();
const { getAll, getMyAchievements, create } = require('../controllers/achievementController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',    getAll);
router.get('/me',  protect, getMyAchievements);
router.post('/',   protect, adminOnly, create);

module.exports = router;
