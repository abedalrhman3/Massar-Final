const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const { sendNotification } = require('./notificationService');

// -------------------------------------------------------
// Check if a user has earned any achievements
// Call this after any action that could trigger one
//
// Example usage:
//   await checkAndAward(userId, 'save_count');
//   await checkAndAward(userId, 'login_streak');
// -------------------------------------------------------
const checkAndAward = async (userId, triggerType) => {
  // 1. Find all achievements for this trigger type
  const achievements = await Achievement.find({ triggerType });
  if (!achievements.length) return;

  // 2. Find which ones the user already has
  const alreadyEarned = await UserAchievement.find({ userId }).select('achievementId');
  const earnedIds = alreadyEarned.map((ua) => ua.achievementId.toString());

  // 3. Filter to only the ones the user hasn't earned yet
  const notYetEarned = achievements.filter(
    (a) => !earnedIds.includes(a._id.toString())
  );
  if (!notYetEarned.length) return;

  // 4. Award them and send a notification for each
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
