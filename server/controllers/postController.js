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
    const post = await Post.create({
      ...req.body,
      user_id: req.user.userId,
      location_id: req.params.locationId,
    });
    const populated = await post.populate('user_id', 'name username');
    res.status(201).json({ success: true, data: populated });
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
