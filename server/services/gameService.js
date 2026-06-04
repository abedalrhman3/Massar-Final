const User = require('../models/User');
const Quest = require('../models/Quest');
const Badge = require('../models/Badge');
const { sendNotification } = require('./notificationService');

// -------------------------------------------------------
// Calculate level from total XP
// -------------------------------------------------------
const calculateLevel = (totalXp) => {
  const level = Math.floor(totalXp / 100) + 1;
  if (level >= 5) return 'Legend';
  if (level >= 2) return 'Expert';
  return 'Explorer';
};

// -------------------------------------------------------
// Complete a task at a location
// Called after photo is uploaded and verified
// -------------------------------------------------------
const completeTask = async (userId, locationId, taskIndex, location) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const tIndex = Number(taskIndex) || 0;
  const task = location.tasks && location.tasks[tIndex] ? location.tasks[tIndex] : null;
  const xpReward = task ? task.xp : location.xp_reward;

  // Grant XP and update level
  user.total_xp += xpReward;
  user.current_level = calculateLevel(user.total_xp);

  let badgeGranted = null;
  let questCompleted = null;

  const isFinalTask =
    !location.tasks ||
    location.tasks.length === 0 ||
    tIndex === location.tasks.length - 1;

  if (isFinalTask) {
    // Grant location badge if not already earned
    if (location.badge_id && !user.unlocked_badges.includes(location.badge_id._id)) {
      user.unlocked_badges.push(location.badge_id._id);
      badgeGranted = location.badge_id;

      await sendNotification(
        userId,
        'system',
        '🏅 New Badge Unlocked!',
        `You earned the "${location.badge_id.title_en}" badge`
      );
    }

    // Mark location as completed
    if (!user.completed_locations.map(String).includes(String(location._id))) {
      user.completed_locations.push(location._id);
    }

    // Check quest completion
    const quests = await Quest.find({ locations: location._id });
    for (const q of quests) {
      if (user.completed_quests.map(String).includes(String(q._id))) continue;

      const hasAll = q.locations.every((locId) =>
        user.completed_locations.map(String).includes(String(locId))
      );

      if (hasAll) {
        user.completed_quests.push(q._id);
        user.total_xp += q.bonus_xp;
        user.current_level = calculateLevel(user.total_xp);

        // Grant title reward
        if (q.title_reward && !user.unlocked_titles.includes(q.title_reward)) {
          user.unlocked_titles.push(q.title_reward);
        }

        // Create/grant quest badge
        if (q.badge_url) {
          let questBadge = await Badge.findOne({ icon_url: q.badge_url });
          if (!questBadge) {
            questBadge = await Badge.create({
              title: q.title + ' Badge',
              title_en: (q.title_en || q.title) + ' Badge',
              icon_url: q.badge_url,
              is_rare: true,
            });
          }
          if (!user.unlocked_badges.map(String).includes(String(questBadge._id))) {
            user.unlocked_badges.push(questBadge._id);
            badgeGranted = questBadge;
          }
        }

        questCompleted = q;

        await sendNotification(
          userId,
          'system',
          '🏆 Quest Completed!',
          `You completed the quest: "${q.title_en || q.title}" and earned ${q.bonus_xp} bonus XP!`
        );
      }
    }

    // Rare badge — unlock if user has 5+ badges
    if (user.unlocked_badges.length >= 5) {
      const rareBadge = await Badge.findOne({ is_rare: true, title_en: 'Jordan Legend' });
      if (rareBadge && !user.unlocked_badges.map(String).includes(String(rareBadge._id))) {
        user.unlocked_badges.push(rareBadge._id);

        await sendNotification(
          userId,
          'system',
          '⭐ Rare Badge Unlocked!',
          'You earned the legendary Jordan Legend badge!'
        );
      }
    }
  }

  await user.save();

  return {
    xp: user.total_xp,
    xpGained: xpReward,
    level: user.current_level,
    badgeGranted,
    questCompleted,
  };
};

// -------------------------------------------------------
// Update active profile frame
// -------------------------------------------------------
const updateFrame = async (userId, frameSlug) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (!user.unlocked_frames.includes(frameSlug)) {
    throw new Error('Frame not unlocked');
  }
  user.active_frame_slug = frameSlug;
  await user.save();
  return user;
};

module.exports = { completeTask, calculateLevel, updateFrame };
