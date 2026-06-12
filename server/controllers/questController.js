const Quest = require('../models/Quest');
const AppError = require('../utils/AppError');

// GET /api/quests  — public
exports.getAll = async (req, res, next) => {
  try {
    const quests = await Quest.find().populate('locations');
    res.json({ success: true, data: quests });
  } catch (err) {
    next(err);
  }
};
exports.getLocationQuests = async (req, res, next) => {
  try {
    const locationId = req.params.locationId;
    const quests = await Quest.find({ locations: locationId }).populate('locations');
    res.json({ success: true, data: quests });
  } catch (err) {
    next(err);
  }
};

// GET /api/quests/:id  — public
exports.getOne = async (req, res, next) => {
  try {
    const quest = await Quest.findById(req.params.id).populate('locations');
    if (!quest) return next(new AppError('Quest not found', 404));
    res.json({ success: true, data: quest });
  } catch (err) {
    next(err);
  }
};

// POST /api/quests  — admin
exports.create = async (req, res, next) => {
  try {
    const quest = await Quest.create(req.body);
    res.status(201).json({ success: true, data: quest });
  } catch (err) {
    next(err);
  }
};

// PUT /api/quests/:id  — admin
exports.update = async (req, res, next) => {
  try {
    const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quest) return next(new AppError('Quest not found', 404));
    res.json({ success: true, data: quest });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/quests/:id  — admin
exports.remove = async (req, res, next) => {
  try {
    const quest = await Quest.findByIdAndDelete(req.params.id);
    if (!quest) return next(new AppError('Quest not found', 404));
    res.json({ success: true, message: 'Quest deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/quests/:id/join — private (handles completion validation, photo upload, and rewards)
exports.joinQuest = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Photo = require('../models/Photo');
    const { uploadPhoto } = require('../services/uploadService');

    const userId = req.user.userId;
    const questId = req.params.id;

    const quest = await Quest.findById(questId);
    if (!quest) return next(new AppError('Quest not found', 404));

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    // Check completed_quests for idempotency (returns early if already done)
    if (!user.completed_quests) user.completed_quests = [];
    const alreadyCompleted = user.completed_quests.map(id => id.toString()).includes(questId.toString());
    if (alreadyCompleted) {
      const updatedUser = await User.findById(userId).select('-passwordHash');
      return res.json({ success: true, message: 'Quest already completed', user: updatedUser });
    }

    // Upload photo and save to Photos collection
    let photoRecord = null;
    if (req.file) {
      const photoUrl = await uploadPhoto(req.file.buffer);
      photoRecord = await Photo.create({
        user_id: userId,
        quest_id: questId,
        photo_url: photoUrl,
      });
      user.uploaded_photos = (user.uploaded_photos ?? 0) + 1;
    }

    // Award quest bonus_xp
    const bonusXp = quest.bonus_xp || 0;
    user.total_xp += bonusXp;

    // Recalculate level titles using the game rules:
    const getTitleForXP = (xp) => {
      if (xp >= 5000) return 'Legend';
      if (xp >= 2000) return 'Pathfinder';
      if (xp >= 1000) return 'Trailblazer';
      if (xp >= 500) return 'Adventurer';
      return 'Explorer';
    };

    const newTitle = getTitleForXP(user.total_xp);
    if (newTitle !== user.current_level) {
      user.current_level = newTitle;
      if (!user.unlocked_titles.includes(newTitle)) {
        user.unlocked_titles.push(newTitle);
      }
    }

    // Store earned badge inline if quest has badge_url
    if (quest.badge_url) {
      if (!user.earned_quest_badges) user.earned_quest_badges = [];
      const alreadyHasBadge = user.earned_quest_badges.some(b => String(b.quest_id) === String(questId));
      if (!alreadyHasBadge) {
        user.earned_quest_badges.push({
          quest_id: questId,
          title: quest.title + ' Badge',
          title_en: (quest.title_en || quest.title) + ' Badge',
          icon_url: quest.badge_url,
        });
      }
    }

    // Pushes to both completed_quests and joined_quests
    if (!user.joined_quests) user.joined_quests = [];
    if (!user.joined_quests.map(String).includes(String(questId))) {
      user.joined_quests.push(questId);
    }
    if (!user.completed_quests.map(String).includes(String(questId))) {
      user.completed_quests.push(questId);
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-passwordHash');
    res.json({ success: true, message: 'Quest completed successfully', user: updatedUser, photo: photoRecord });
  } catch (err) {
    next(err);
  }
};