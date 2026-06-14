const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const AppError = require('../utils/AppError');


exports.getAll = async (req, res, next) => {
  try {
    const achievements = await Achievement.find();
    res.json({ success: true, data: achievements });
  } catch (err) {
    next(err);
  }
};


exports.getMyAchievements = async (req, res, next) => {
  try {
    const userAchievements = await UserAchievement.find({ userId: req.user.userId })
      .populate('achievementId');
    res.json({ success: true, data: userAchievements });
  } catch (err) {
    next(err);
  }
};


exports.create = async (req, res, next) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json({ success: true, data: achievement });
  } catch (err) {
    next(err);
  }
};
