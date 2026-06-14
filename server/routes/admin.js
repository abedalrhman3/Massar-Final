const router = require('express').Router();
const { getBudgetSettings, updateBudgetSettings, create: createLocation, remove: removeLocation } = require('../controllers/locationController');
const { create: createQuest, remove: removeQuest } = require('../controllers/questController');
const { getReported: getReportedPhotos, remove: removePhoto, reviewPhoto } = require('../controllers/photoController');
const { uploadAsset } = require('../controllers/gameController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() });


router.use(protect, adminOnly);


router.get('/settings/budget', getBudgetSettings);
router.post('/settings/budget', updateBudgetSettings);


router.post('/add-location', createLocation);
router.delete('/locations/:id', removeLocation);


router.post('/upload-asset', upload.single('asset'), uploadAsset);


router.get('/reported-photos', getReportedPhotos);
router.delete('/photos/:id', removePhoto);
router.put('/photos/:id/review', reviewPhoto);


router.post('/add-quest', createQuest);
router.delete('/quests/:id', removeQuest);

module.exports = router;
