const router = require('express').Router();
const {
  togglePrivacy, reportPhoto,
  getReported, remove, getPublicPhotos,
  reviewPhoto
} = require('../controllers/photoController');
const { protect, adminOnly } = require('../middleware/auth');

// Static routes FIRST — before /:id
router.get('/reported', protect, adminOnly, getReported);

// Dynamic routes after
router.get('/:id', getPublicPhotos);
router.put('/:id/privacy', protect, togglePrivacy);
router.post('/:id/report', protect, reportPhoto);
router.delete('/:id', protect, adminOnly, remove);

// ── NEW: Admin review decision for AI-flagged photos ─────────────────────
// PUT /api/admin/photos/:id/review
// body: { decision: 'approve' | 'reject' }
router.put('/:id/review', protect, adminOnly, reviewPhoto);

module.exports = router;