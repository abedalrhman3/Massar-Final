const Photo = require('../models/Photo');
const Location = require('../models/Location');
const { completeTask } = require('../services/gameService');
const { uploadPhoto, deleteFromCloudinary } = require('../services/uploadService');
const AppError = require('../utils/AppError');
const { getDistanceInMeters } = require('../utils/distance');

// -------------------------------------------------------
// POST /api/locations/:locationId/complete-task  — private
// (unchanged — location check-ins don't use AI validation)
// -------------------------------------------------------
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
      photoRecord = await Photo.create({
        user_id: userId,
        location_id: locationId,
        task_index: Number(taskIndex) || 0,
        photo_url: photoUrl,
        // No AI fields — location check-ins bypass AI validation
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

// GET /api/photos  — public (community photos feed)
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

// GET /api/users/:id/photos  — private
exports.getUserPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id }).populate('location_id');
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

// PUT /api/photos/:id/privacy  — private (owner only)
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

// POST /api/photos/:id/report  — private (user manual report)
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

// -------------------------------------------------------
// GET /api/admin/reported-photos  — admin
// Returns both:
//   • manually reported photos (is_reported: true)
//   • AI-flagged photos pending review (status: 'pending_review')
// -------------------------------------------------------
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

// -------------------------------------------------------
// PUT /api/admin/photos/:id/review  — admin
//
// Admin decision on a pending_review (AI-flagged) photo.
//
// body: { decision: 'approve' | 'reject' }
//
// approve → mark photo approved, complete the quest & award XP/badge
// reject  → delete photo from Cloudinary + DB (optionally ban user separately)
// -------------------------------------------------------
exports.reviewPhoto = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Quest = require('../models/Quest');

    const { decision } = req.body;
    if (!['approve', 'reject'].includes(decision)) {
      return next(new AppError('decision must be "approve" or "reject"', 400));
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));

    if (photo.status !== 'pending_review') {
      return next(new AppError(`Photo is already in status: ${photo.status}`, 400));
    }

    // ── REJECT: delete from Cloudinary + DB ─────────────
    if (decision === 'reject') {
      await deleteFromCloudinary(photo.photo_url);
      await Photo.findByIdAndDelete(photo._id);

      return res.json({
        success: true,
        message: 'Photo rejected and permanently deleted.',
      });
    }

    // ── APPROVE: complete the quest for this user ────────
    photo.status = 'approved';
    photo.ai_appropriate = true; // admin overrides AI flag
    photo.is_reported = false;
    await photo.save();

    // Only award quest rewards if this photo is tied to a quest
    if (photo.quest_id) {
      const user = await User.findById(photo.user_id);
      const quest = await Quest.findById(photo.quest_id);

      if (user && quest) {
        // Guard: don't double-award if quest was somehow already completed
        const alreadyCompleted = (user.completed_quests || [])
          .map(String)
          .includes(String(quest._id));

        if (!alreadyCompleted) {
          // Award XP
          const bonusXp = quest.bonus_xp || 0;
          user.total_xp += bonusXp;

          // Recalculate level
          const newTitle = getTitleForXP(user.total_xp);
          if (newTitle !== user.current_level) {
            user.current_level = newTitle;
            if (!user.unlocked_titles.includes(newTitle)) {
              user.unlocked_titles.push(newTitle);
            }
          }

          // Award badge
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

          // Mark quest completed
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

    // Photo approved but no quest rewards to give (or quest already done)
    return res.json({
      success: true,
      message: 'Photo approved.',
      photo,
    });

  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/photos/:id  — admin (hard delete any photo)
exports.remove = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return next(new AppError('Photo not found', 404));

    // Clean up from Cloudinary too
    await deleteFromCloudinary(photo.photo_url).catch(err =>
      console.warn('[CLOUDINARY] Delete failed (continuing):', err.message)
    );

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function getTitleForXP(xp) {
  if (xp >= 5000) return 'Legend';
  if (xp >= 2000) return 'Pathfinder';
  if (xp >= 1000) return 'Trailblazer';
  if (xp >= 500) return 'Adventurer';
  return 'Explorer';
}