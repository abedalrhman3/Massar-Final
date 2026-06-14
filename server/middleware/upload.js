const multer = require('multer');
const AppError = require('../utils/AppError');



const storage = multer.memoryStorage();


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
  limits: { fileSize: 10 * 1024 * 1024 }, 
});





exports.single = (fieldName) => upload.single(fieldName);



exports.multiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);




exports.fields = (fieldSpec) => upload.fields(fieldSpec);
