const User = require('../models/User');
const AppError = require('../utils/AppError');


exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ total_xp: -1 })
      .limit(10)
      .select('name username total_xp current_level active_frame_slug unlocked_badges')
      .populate('unlocked_badges', 'title_en icon_url is_rare');

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};
