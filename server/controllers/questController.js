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

    let pendingReviewQuestIds = [];
    if (req.user) {
      const Photo = require('../models/Photo');
      const pendingPhotos = await Photo.find({
        user_id: req.user.userId,
        status: 'pending_review',
        quest_id: { $in: quests.map(q => q._id) },
      }).select('quest_id');

      pendingReviewQuestIds = pendingPhotos.map(p => String(p.quest_id));
    }

    res.json({
      success: true,
      data: quests,
      pending_review_quest_ids: pendingReviewQuestIds,
    });

    console.log('req.user:', req.user);
    console.log('pendingReviewQuestIds:', pendingReviewQuestIds);
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
    const { generateAiRequirement } = require('../services/validateQuestPhotoService');
    if (!req.body.ai_requirement && (req.body.description_en || req.body.description || req.body.title_en || req.body.title)) {
      const title = req.body.title_en || req.body.title;
      const desc = req.body.description_en || req.body.description || '';
      console.log(`[QUEST] Generating ai_requirement automatically for: "${title}"`);
      req.body.ai_requirement = await generateAiRequirement(title, desc);
    }
    const quest = await Quest.create(req.body);
    res.status(201).json({ success: true, data: quest });
  } catch (err) {
    next(err);
  }
};

// PUT /api/quests/:id  — admin
exports.update = async (req, res, next) => {
  try {
    const { generateAiRequirement } = require('../services/validateQuestPhotoService');
    if (!req.body.ai_requirement && (req.body.description_en || req.body.description || req.body.title_en || req.body.title)) {
      const title = req.body.title_en || req.body.title;
      const desc = req.body.description_en || req.body.description || '';
      console.log(`[QUEST] Generating/updating ai_requirement automatically for: "${title}"`);
      req.body.ai_requirement = await generateAiRequirement(title, desc);
    }
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quests/:id/join  — private
//
// SCENARIO 1 — AI flags photo as inappropriate:
//   • Photo saved to gallery with status: 'pending_review', ai_appropriate: false
//   • ⚠️ Warning shown to user: photo is under review, quest not completed
//   • Admin sees it in reported photos panel
//   • Admin decision (approve/reject) handled in photoController.reviewPhoto
//
// SCENARIO 2 — AI approves photo AND it fulfills the quest:
//   • Photo saved with status: 'approved'
//   • XP, level, and badge awarded immediately
//   • Quest marked completed
//
// SCENARIO 3 — AI approves photo but it does NOT fulfill the quest:
//   • Photo saved with status: 'rejected' (kept in gallery so user sees reason)
//   • Reason returned to frontend to show the user
//   • Quest NOT completed — user can try again
// ─────────────────────────────────────────────────────────────────────────────
exports.joinQuest = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Photo = require('../models/Photo');
    const { uploadPhoto } = require('../services/uploadService');
    const { validateQuestPhoto } = require('../services/validateQuestPhotoService');

    const userId = req.user.userId;
    const questId = req.params.id;

    // ── Load quest & user ────────────────────────────────
    const quest = await Quest.findById(questId);
    if (!quest) return next(new AppError('Quest not found', 404));

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    // ── Idempotency guard ────────────────────────────────
    if (!user.completed_quests) user.completed_quests = [];
    const alreadyCompleted = user.completed_quests
      .map(String)
      .includes(String(questId));

    if (alreadyCompleted) {
      const updatedUser = await User.findById(userId).select('-passwordHash');
      return res.json({ success: true, message: 'Quest already completed', user: updatedUser });
    }

    // ── Photo is required for quest submission ───────────
    if (!req.file) {
      return next(new AppError('A photo is required to complete a quest.', 400));
    }

    // ── Step 1: Upload to Cloudinary (always, regardless of AI result) ───────
    // We save the photo in all 3 scenarios so it appears in the user's gallery.
    const photoUrl = await uploadPhoto(req.file.buffer);

    // ── Step 2: AI validation ────────────────────────────
    // 1. Run strict global safety check first
    const { checkPhotoSafety } = require('../services/validateQuestPhotoService');
    console.log(`[QUEST] Running global safety check for quest: ${questId}`);
    const safetyResult = await checkPhotoSafety(req.file.buffer, req.file.mimetype);
    console.log(`[QUEST] Safety check result:`, safetyResult);

    if (!safetyResult.is_appropriate) {
      const photoRecord = await Photo.create({
        user_id: userId,
        quest_id: questId,
        photo_url: photoUrl,
        ai_appropriate: false,
        ai_fulfills_quest: false,
        ai_reason: safetyResult.reason || 'Inappropriate content detected.',
        status: 'pending_review',
        is_reported: true,
      });

      // SCENARIO 1 (both places) — after creating photoRecord
      return res.status(200).json({
        success: false,
        scenario: 'inappropriate',
        message: 'Your photo has been flagged for review...',
        photo: photoRecord,
        pending_review_quest_ids: [String(questId)],
      });
    }

    // 2. Safely generate requirement on-the-fly if missing
    let requirement = quest.ai_requirement;
    if (!requirement) {
      console.log(`[QUEST] Quest ${questId} has no ai_requirement. Generating one on-the-fly...`);
      const { generateAiRequirement } = require('../services/validateQuestPhotoService');
      const title = quest.title_en || quest.title;
      const desc = quest.description_en || quest.description || '';
      requirement = await generateAiRequirement(title, desc);

      // Save it back to the database for future validations
      quest.ai_requirement = requirement;
      await quest.save();
      console.log(`[QUEST] Saved generated ai_requirement: "${requirement}" for quest: ${questId}`);
    }

    console.log(`[QUEST] Running AI validation for quest: ${questId}`);
    const aiResult = await validateQuestPhoto(
      req.file.buffer,
      req.file.mimetype,
      requirement
    );
    console.log(`[QUEST] AI result:`, aiResult);

    // ── Step 3: Branch on AI result ─────────────────────

    // ── SCENARIO 1: Inappropriate content ───────────────
    if (!aiResult.is_appropriate) {
      const photoRecord = await Photo.create({
        user_id: userId,
        quest_id: questId,
        photo_url: photoUrl,
        ai_appropriate: false,
        ai_fulfills_quest: false,
        ai_reason: aiResult.reason,
        status: 'pending_review',
        is_reported: true, // surfaces in existing getReported admin endpoint
      });

      return res.status(200).json({
        success: false,
        scenario: 'inappropriate',
        message: 'Your photo has been flagged for review. Our team will review it shortly. The quest will not be completed until the review is resolved.',
        photo: photoRecord,
      });
    }

    // ── SCENARIO 3: Appropriate but doesn't fulfill quest ──
    if (!aiResult.fulfills_quest) {
      const photoRecord = await Photo.create({
        user_id: userId,
        quest_id: questId,
        photo_url: photoUrl,
        ai_appropriate: true,
        ai_fulfills_quest: false,
        ai_reason: aiResult.reason,
        status: 'rejected',
      });

      return res.status(200).json({
        success: false,
        scenario: 'rejected',
        message: 'Your photo does not meet the quest requirement.',
        reason: aiResult.reason,
        photo: photoRecord,
      });
    }

    // ── SCENARIO 2: Appropriate AND fulfills quest ───────
    const photoRecord = await Photo.create({
      user_id: userId,
      quest_id: questId,
      photo_url: photoUrl,
      ai_appropriate: true,
      ai_fulfills_quest: true,
      ai_reason: aiResult.reason,
      status: 'approved',
    });

    user.uploaded_photos = (user.uploaded_photos ?? 0) + 1;

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

    // Award quest badge
    if (quest.badge_url) {
      if (!user.earned_quest_badges) user.earned_quest_badges = [];
      const alreadyHasBadge = user.earned_quest_badges
        .some(b => String(b.quest_id) === String(questId));
      if (!alreadyHasBadge) {
        user.earned_quest_badges.push({
          quest_id: questId,
          title: quest.title + ' Badge',
          title_en: (quest.title_en || quest.title) + ' Badge',
          icon_url: quest.badge_url,
        });
      }
    }

    // Mark quest joined + completed
    if (!user.joined_quests) user.joined_quests = [];
    if (!user.joined_quests.map(String).includes(String(questId))) {
      user.joined_quests.push(questId);
    }
    if (!user.completed_quests.map(String).includes(String(questId))) {
      user.completed_quests.push(questId);
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-passwordHash');

    return res.json({
      success: true,
      scenario: 'approved',
      message: `Quest completed! You earned ${bonusXp} XP!`,
      xpGained: bonusXp,
      user: updatedUser,
      photo: photoRecord,
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: XP → title (mirrors the logic already in your codebase)
// ─────────────────────────────────────────────────────────────────────────────
function getTitleForXP(xp) {
  if (xp >= 5000) return 'Legend';
  if (xp >= 2000) return 'Pathfinder';
  if (xp >= 1000) return 'Trailblazer';
  if (xp >= 500) return 'Adventurer';
  return 'Explorer';
}