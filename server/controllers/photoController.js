const Photo = require('../models/Photo');
const Location = require('../models/Location');
const { completeTask } = require('../services/gameService');
const { uploadPhoto, deleteFromCloudinary } = require('../services/uploadService');
const AppError = require('../utils/AppError');
const { getDistanceInMeters } = require('../utils/distance');





exports.completeTask = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const { taskIndex, userLat, userLng } = req.body;
    const userId = req.user.userId;

    const location = await Location.findById(locationId).populate('badge_id');
    if (!location) return next(new AppError('Location not found', 404));

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

    let photoRecord = null;
    if (req.file) {
      const photoUrl = await uploadPhoto(req.file.buffer);

      
      const { checkPhotoSafety } = require('../services/validateQuestPhotoService');
      console.log(`[PHOTO] Running global safety check for location: ${locationId}`);
      const safetyResult = await checkPhotoSafety(req.file.buffer, req.file.mimetype);
      console.log(`[PHOTO] Safety check result:`, safetyResult);

      if (!safetyResult.is_appropriate) {
        photoRecord = await Photo.create({
          user_id: userId,
          location_id: locationId,
          task_index: Number(taskIndex) || 0,
          photo_url: photoUrl,
          ai_appropriate: false,
          ai_fulfills_quest: false,
          ai_reason: safetyResult.reason || 'Inappropriate content detected.',
          status: 'pending_review',
          is_reported: true,
        });

        return res.status(200).json({
          success: false,
          scenario: 'inappropriate',
          message: 'Your photo has been flagged for review. Our team will review it shortly. The task will not be completed until the review is resolved.',
          photo: photoRecord,
        });
      }

      photoRecord = await Photo.create({
        user_id: userId,
        location_id: locationId,
        task_index: Number(taskIndex) || 0,
        photo_url: photoUrl,
        ai_appropriate: true,
        status: 'approved',
      });
    }

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


exports.getPublicPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id })
      .populate('location_id')
      .populate('quest_id', 'title title_en')
      .populate('user_id', 'username name');
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};


exports.getUserPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).populate('location_id');
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};


exports.togglePrivacy = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));
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







exports.getReported = async (req, res, next) => {
  try {
    const photos = await Photo.find({
      $or: [
        { is_reported: true },
        { status: 'pending_review' },
      ],
    })
      .populate('user_id', 'name email username')
      .populate('quest_id', 'title title_en')
      .populate('location_id', 'name_en');

    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};











exports.reviewPhoto = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Quest = require('../models/Quest');

    const { decision } = req.body;
    if (!['approve', 'reject', 'ban'].includes(decision)) {
      return next(new AppError('decision must be "approve", "reject" or "ban"', 400));
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));

    if (photo.status !== 'pending_review' && !photo.is_reported) {
      return next(new AppError('Photo is not flagged or reported', 400));
    }

    
    if (decision === 'ban') {
      const UserSession = require('../models/UserSession');

      const user = await User.findById(photo.user_id);
      if (!user) return next(new AppError('User not found for this photo', 404));

      if (user._id.toString() === req.user.userId) {
        return next(new AppError('You cannot ban yourself', 400));
      }

      user.isBanned = true;
      await user.save();
      await UserSession.deleteMany({ userId: user._id });

      await deleteFromCloudinary(photo.photo_url).catch(err =>
        console.warn('[CLOUDINARY] Delete failed (continuing):', err.message)
      );
      await Photo.findByIdAndDelete(photo._id);

      return res.json({
        success: true,
        message: 'User has been banned and the photo has been permanently deleted.',
      });
    }

    
    if (decision === 'reject') {
      const { reason, deletePhoto, banUser } = req.body;

      if (banUser) {
        const UserSession = require('../models/UserSession');

        const user = await User.findById(photo.user_id);
        if (!user) return next(new AppError('User not found for this photo', 404));

        if (user._id.toString() === req.user.userId) {
          return next(new AppError('You cannot ban yourself', 400));
        }

        user.isBanned = true;
        await user.save();
        await UserSession.deleteMany({ userId: user._id });

        await deleteFromCloudinary(photo.photo_url).catch(err =>
          console.warn('[CLOUDINARY] Delete failed (continuing):', err.message)
        );
        await Photo.findByIdAndDelete(photo._id);

        return res.json({
          success: true,
          message: 'User has been banned and the photo has been permanently deleted.',
        });
      }

      if (deletePhoto) {
        await deleteFromCloudinary(photo.photo_url).catch(err =>
          console.warn('[CLOUDINARY] Delete failed (continuing):', err.message)
        );
        await Photo.findByIdAndDelete(photo._id);

        return res.json({
          success: true,
          message: 'Photo rejected and permanently deleted.',
        });
      }

      photo.status = 'rejected';
      photo.is_reported = false;
      photo.ai_appropriate = false;
      photo.ai_reason = reason || 'Rejected by moderator';
      await photo.save();

      return res.json({
        success: true,
        message: 'Photo rejected and marked in database.',
        photo,
      });
    }

    
    photo.status = 'approved';
    photo.ai_appropriate = true; 
    photo.is_reported = false;
    await photo.save();

    
    if (photo.quest_id) {
      const user = await User.findById(photo.user_id);
      const quest = await Quest.findById(photo.quest_id);

      if (user && quest) {
        
        const alreadyCompleted = (user.completed_quests || [])
          .map(String)
          .includes(String(quest._id));

        if (!alreadyCompleted) {
          
          const bonusXp = quest.bonus_xp || 0;
          user.total_xp += bonusXp;

          
          const newTitle = getTitleForXP(user.total_xp);
          if (newTitle !== user.current_level) {
            user.current_level = newTitle;
            if (!user.unlocked_titles.includes(newTitle)) {
              user.unlocked_titles.push(newTitle);
            }
          }

          
          if (quest.badge_url) {
            if (!user.earned_quest_badges) user.earned_quest_badges = [];
            const alreadyHasBadge = user.earned_quest_badges
              .some(b => String(b.quest_id) === String(quest._id));
            if (!alreadyHasBadge) {
              user.earned_quest_badges.push({
                quest_id: quest._id,
                title: quest.title + ' Badge',
                title_en: (quest.title_en || quest.title) + ' Badge',
                icon_url: quest.badge_url,
              });
            }
          }

          
          if (!user.joined_quests) user.joined_quests = [];
          if (!user.joined_quests.map(String).includes(String(quest._id))) {
            user.joined_quests.push(quest._id);
          }
          if (!user.completed_quests) user.completed_quests = [];
          user.completed_quests.push(quest._id);

          await user.save();

          return res.json({
            success: true,
            message: `Photo approved. Quest completed for user. ${bonusXp} XP awarded.`,
            photo,
          });
        }
      }
    }

    
    return res.json({
      success: true,
      message: 'Photo approved.',
      photo,
    });

  } catch (err) {
    next(err);
  }
};


exports.remove = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));

    
    await deleteFromCloudinary(photo.photo_url).catch(err =>
      console.warn('[CLOUDINARY] Delete failed (continuing):', err.message)
    );

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
};




function getTitleForXP(xp) {
  if (xp >= 5000) return 'Legend';
  if (xp >= 2000) return 'Pathfinder';
  if (xp >= 1000) return 'Trailblazer';
  if (xp >= 500) return 'Adventurer';
  return 'Explorer';
}