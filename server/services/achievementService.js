const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const { sendNotification } = require('./notificationService');









const checkAndAward = async (userId, triggerType) => {
  
  const achievements = await Achievement.find({ triggerType });
  if (!achievements.length) return;

  
  const alreadyEarned = await UserAchievement.find({ userId }).select('achievementId');
  const earnedIds = alreadyEarned.map((ua) => ua.achievementId.toString());

  
  const notYetEarned = achievements.filter(
    (a) => !earnedIds.includes(a._id.toString())
  );
  if (!notYetEarned.length) return;

  
  for (const achievement of notYetEarned) {
    await UserAchievement.create({ userId, achievementId: achievement._id, earnedAt: new Date() });

    await sendNotification(
      userId,
      'system',
      '🏆 Achievement Unlocked!',
      `You earned: ${achievement.name}`
    );
  }
};

module.exports = { checkAndAward };
