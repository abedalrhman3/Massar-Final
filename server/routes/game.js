const router = require('express').Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const { updateFrame, getProfile, uploadAsset } = require('../controllers/gameController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/leaderboard',          getLeaderboard);
router.get('/users/:id/profile',    getProfile);
router.post('/user/update-frame',   protect, updateFrame);


router.post('/admin/upload-asset',  protect, adminOnly, upload.single('asset'), uploadAsset);

module.exports = router;
