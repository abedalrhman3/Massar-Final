const router = require('express').Router();
const { getBudgetSettings, updateBudgetSettings, create: createLocation, remove: removeLocation } = require('../controllers/locationController');
const { create: createQuest, remove: removeQuest } = require('../controllers/questController');
const { getReported: getReportedPhotos, remove: removePhoto } = require('../controllers/photoController');
const { uploadAsset } = require('../controllers/gameController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');

// Standard memory upload to pipe straight to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Secure the entire admin router
router.use(protect, adminOnly);

// Settings
router.get('/settings/budget', getBudgetSettings);
router.post('/settings/budget', updateBudgetSettings);

// Locations
router.post('/add-location', createLocation);
router.delete('/locations/:id', removeLocation);

// Assets
router.post('/upload-asset', upload.single('asset'), uploadAsset);

// Photos
router.get('/reported-photos', getReportedPhotos);
router.delete('/photos/:id', removePhoto);

// Quests
router.post('/add-quest', createQuest);
router.delete('/quests/:id', removeQuest);

module.exports = router;
