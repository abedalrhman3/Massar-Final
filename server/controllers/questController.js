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
    const userId = req.user.userId;
    const questId = req.params.id;

    const quest = await Quest.findById(questId);
    if (!quest) return next(new AppError('Quest not found', 404));

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    if (!user.joined_quests) {
      user.joined_quests = [];
    }

    const questIdStr = questId.toString();
    const joinedStrs = user.joined_quests.map(id => id.toString());

    if (!joinedStrs.includes(questIdStr)) {
      user.joined_quests.push(questId);
      await user.save();
    }

    const updatedUser = await User.findById(userId).select('-passwordHash');
    res.json({ success: true, message: 'Quest joined successfully', user: updatedUser });
  } catch (err) {
    next(err);
  }
};
