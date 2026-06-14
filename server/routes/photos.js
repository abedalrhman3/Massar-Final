const router = require('express').Router();
const {
  togglePrivacy, reportPhoto,
  getReported, remove, getPublicPhotos,
  reviewPhoto
} = require('../controllers/photoController');
const { protect, adminOnly } = require('../middleware/auth');


router.get('/reported', protect, adminOnly, getReported);


router.get('/', getPublicPhotos);
router.get('/:id', protect, getPublicPhotos);
router.put('/:id/privacy', protect, togglePrivacy);
router.post('/:id/report', protect, reportPhoto);
router.delete('/:id', protect, remove);




router.put('/:id/review', protect, adminOnly, reviewPhoto);

module.exports = router;