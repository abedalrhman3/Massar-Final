const User = require('../models/User');
const { updateFrame } = require('../services/gameService');
const { uploadAsset } = require('../services/uploadService');
const AppError = require('../utils/AppError');


exports.updateFrame = async (req, res, next) => {
  try {
    const { frameSlug } = req.body;
    const user = await updateFrame(req.user.userId, frameSlug);
    res.json({ success: true, active_frame_slug: user.active_frame_slug });
  } catch (err) {
    next(err);
  }
};


exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('unlocked_badges', 'title_en icon_url is_rare')
      .populate('completed_locations', 'name_en coordinates')
      .populate('completed_quests', 'title_en bonus_xp');

    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};


exports.uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded', 400));
    const fileUrl = await uploadAsset(req.file.buffer);
    res.json({ success: true, fileUrl });
  } catch (err) {
    next(err);
  }
};
