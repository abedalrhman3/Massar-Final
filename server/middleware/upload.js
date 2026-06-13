const multer = require('multer');
const AppError = require('../utils/AppError');

// Store file in memory as a buffer (not on disk)
// We pass the buffer directly to Cloudinary
const storage = multer.memoryStorage();

// Only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Ready-to-use middleware for different upload scenarios:

// Single photo upload  -> use on check-in, profile picture, destination image
// req.file will contain the uploaded file
exports.single = (fieldName) => upload.single(fieldName);

// Multiple photos upload -> use if you need multiple files at once
// req.files will contain the uploaded files
exports.multiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

// Mixed upload -> multiple named fields in one request
// e.g. fields([{ name: 'coverImage', maxCount: 1 }, { name: 'images', maxCount: 10 }])
// req.files will be an object keyed by field name
exports.fields = (fieldSpec) => upload.fields(fieldSpec);
