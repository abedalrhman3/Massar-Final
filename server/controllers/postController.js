const Post = require('../models/Post');
const AppError = require('../utils/AppError');

// GET /api/locations/:locationId/posts  — public
exports.getByLocation = async (req, res, next) => {
  try {
    const posts = await Post.find({ location_id: req.params.locationId })
      .populate('user_id', 'name username active_frame_slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

// POST /api/locations/:locationId/posts  — private
exports.create = async (req, res, next) => {
  try {
    const { uploadPhoto } = require('../services/uploadService');
    const { calculateLevel } = require('../services/gameService');
    const { sendNotification } = require('../services/notificationService');
    const User = require('../models/User');

    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = await uploadPhoto(req.file.buffer);
    }

    const post = await Post.create({
      content: req.body.content,
      rating: req.body.rating ? Number(req.body.rating) : undefined,
      image_url: imageUrl,
      user_id: req.user.userId,
      location_id: req.params.locationId,
    });

    const populated = await post.populate('user_id', 'name username active_frame_slug');

    // Gamification Engine: Award 50 XP for writing a review/comment
    const xpReward = 50;
    const user = await User.findById(req.user.userId);
    let xpGained = 0;
    let newXp = 0;
    let newLevel = '';

    if (user) {
      user.total_xp = (user.total_xp || 0) + xpReward;
      user.current_level = calculateLevel(user.total_xp);
      await user.save();

      xpGained = xpReward;
      newXp = user.total_xp;
      newLevel = user.current_level;

      await sendNotification(
        req.user.userId,
        'system',
        '💬 تعليق وتقييم المعالم',
        `أحسنت! ربحت +${xpReward} XP لكتابة تعليق وتقييم الموقع!`
      );
    }

    res.status(201).json({
      success: true,
      data: populated,
      xpGained,
      xp: newXp,
      level: newLevel,
      message: `ربحت ${xpReward} XP لمشاركتك!`,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id  — private (owner or admin)
exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('Post not found', 404));

    const isOwner = String(post.user_id) === String(req.user.userId);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new AppError('Not authorized', 403));

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};
