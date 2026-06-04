const router = require('express').Router();
const {
  togglePrivacy, reportPhoto,
  getReported, remove, getPublicPhotos,
} = require('../controllers/photoController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getPublicPhotos);
router.put('/:id/privacy', protect, togglePrivacy);
router.post('/:id/report', protect, reportPhoto);

// Admin
router.get('/reported',   protect, adminOnly, getReported);
router.delete('/:id',     protect, adminOnly, remove);

module.exports = router;
