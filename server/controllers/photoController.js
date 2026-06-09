const Photo = require('../models/Photo');
const Location = require('../models/Location');
const { completeTask } = require('../services/gameService');
const { uploadPhoto } = require('../services/uploadService');
const AppError = require('../utils/AppError');
const { getDistanceInMeters } = require('../utils/distance');

// -------------------------------------------------------
// POST /api/locations/:locationId/complete-task  — private
// Uploads photo to Cloudinary, grants XP, checks badges/quests
// -------------------------------------------------------
exports.completeTask = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const { taskIndex, userLat, userLng } = req.body;
    const userId = req.user.userId;

    const location = await Location.findById(locationId).populate('badge_id');
    if (!location) return next(new AppError('Location not found', 404));

    // Spatial Verification Engine
    if (userLat && userLng && location.coordinates) {
      const distance = getDistanceInMeters(
        Number(userLat),
        Number(userLng),
        location.coordinates.lat,
        location.coordinates.lng
      );
      if (distance > 500) {
        return next(
          new AppError(
            'Spatial Verification Failed: You must be within 500 meters of the location to check-in.',
            400
          )
        );
      }
    }

    // Upload photo to Cloudinary if provided
    let photoRecord = null;
    if (req.file) {
      const photoUrl = await uploadPhoto(req.file.buffer);
      photoRecord = await Photo.create({
        user_id: userId,
        location_id: locationId,
        task_index: Number(taskIndex) || 0,
        photo_url: photoUrl,
      });
    }

    // Run game logic — XP, badges, quests
    const result = await completeTask(userId, locationId, taskIndex, location);

    res.json({
      success: true,
      message: `You earned ${result.xpGained} XP!`,
      ...result,
      photo: photoRecord,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/photos  — public (community photos feed)
exports.getPublicPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id })
      .populate('location_id')
      .populate('user_id', 'username name');
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/photos  — private
exports.getUserPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).populate('location_id');
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

// PUT /api/photos/:id/privacy  — private
exports.togglePrivacy = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));
    // Only the owner can toggle privacy
    if (String(photo.user_id) !== String(req.user.userId)) {
      return next(new AppError('Not authorized', 403));
    }
    photo.is_private = !photo.is_private;
    await photo.save();
    res.json({ success: true, data: photo });
  } catch (err) {
    next(err);
  }
};

// POST /api/photos/:id/report  — private
exports.reportPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { is_reported: true },
      { new: true }
    );
    if (!photo) return next(new AppError('Photo not found', 404));
    res.json({ success: true, message: 'Photo reported' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reported-photos  — admin
exports.getReported = async (req, res, next) => {
  try {
    const photos = await Photo.find({ is_reported: true })
      .populate('user_id', 'name email')
      .populate('location_id', 'name_en');
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/photos/:id  — admin
exports.remove = async (req, res, next) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
};
