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

// POST /api/quests/:id/join — private
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

    // Upload photo and save to Photos collection
    let photoRecord = null;
    if (req.file) {
      const photoUrl = await uploadPhoto(req.file.buffer);
      photoRecord = await Photo.create({
        user_id: userId,
        quest_id: questId,
        photo_url: photoUrl,
      });
    }

    // Mark quest as joined (idempotent)
    if (!user.joined_quests) user.joined_quests = [];
    const alreadyJoined = user.joined_quests.map(id => id.toString()).includes(questId.toString());
    if (!alreadyJoined) {
      user.joined_quests.push(questId);
      await user.save();
    }

    const updatedUser = await User.findById(userId).select('-passwordHash');
    res.json({ success: true, message: 'Quest joined successfully', user: updatedUser, photo: photoRecord });
  } catch (err) {
    next(err);
  }
};