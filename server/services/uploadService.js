const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');






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






const uploadPhoto = (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, 'massar/photos');
};






const uploadDestinationImage = (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, 'massar/destinations');
};






const uploadAsset = (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, 'massar/assets');
};





const uploadHotelImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/hotels');
const uploadPlaceImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/places');
const uploadRestaurantImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/restaurants');
const uploadEventImage = (fileBuffer) => uploadToCloudinary(fileBuffer, 'massar/events');





const deleteFromCloudinary = async (fileUrl) => {
  
  
  
  const parts = fileUrl.split('/');
  const uploadIndex = parts.indexOf('upload');

  
  const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
  
  const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

  await cloudinary.uploader.destroy(publicId);
};





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
