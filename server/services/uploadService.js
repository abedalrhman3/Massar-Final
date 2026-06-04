const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// -------------------------------------------------------
// Upload a single file buffer to Cloudinary
// folder    → where it's stored in your Cloudinary account
// Returns   → the secure URL to save in MongoDB
// -------------------------------------------------------
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(new AppError('Image upload failed', 500));
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// -------------------------------------------------------
// Upload a check-in photo
// Stored in: massar/photos
// Used in:   photoController → completeTask
// -------------------------------------------------------
const uploadPhoto = (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, 'massar/photos');
};

// -------------------------------------------------------
// Upload a destination cover image
// Stored in: massar/destinations
// Used in:   destinationController → create / update
// -------------------------------------------------------
const uploadDestinationImage = (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, 'massar/destinations');
};

// -------------------------------------------------------
// Upload an admin asset (badge icon, quest badge, etc.)
// Stored in: massar/assets
// Used in:   gameController → uploadAsset
// -------------------------------------------------------
const uploadAsset = (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, 'massar/assets');
};

// -------------------------------------------------------
// Upload functions for Hotels, Places, Restaurants, Events
// Each stored in its own Cloudinary folder
// -------------------------------------------------------
const uploadHotelImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/hotels');
const uploadPlaceImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/places');
const uploadRestaurantImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/restaurants');
const uploadEventImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/events');

// -------------------------------------------------------
// Delete a file from Cloudinary by its URL
// Used when deleting a destination or photo from DB
// -------------------------------------------------------
const deleteFromCloudinary = async (fileUrl) => {
  // Extract the full public_id from the Cloudinary URL.
  // URL format: https://res.cloudinary.com/cloud/image/upload/v123456/folder1/folder2/filename.ext
  // public_id  = everything after 'upload/v{version}/', without the file extension.
  const parts = fileUrl.split('/');
  const uploadIndex = parts.indexOf('upload');

  // Join all path segments after 'upload' and the version number (upload + 1)
  const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
  // Strip the file extension
  const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

  await cloudinary.uploader.destroy(publicId);
};

// -------------------------------------------------------
// Delete multiple Cloudinary images by URL array
// Used on entity delete / image replacemen
// -------------------------------------------------------
const deleteMultipleFromCloudinary = async (urlArray = []) => {
  await Promise.all(urlArray.map((url) => deleteFromCloudinary(url)));
};

module.exports = {
  uploadPhoto,
  uploadDestinationImage,
  uploadAsset,
  uploadHotelImage,
  uploadPlaceImage,
  uploadRestaurantImage,
  uploadEventImage,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
