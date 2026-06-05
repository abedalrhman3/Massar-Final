const Comment = require('../models/Comment');
const AppError = require('../utils/AppError');

function formatComment(comment, currentUserId) {
  const user = comment.userId || {};
  const name = user.name || user.username || 'Anonymous';
  
  const parts = name.split(' ');
  const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'AN';

  const colors = ['#c4a882', '#1B56FD', '#9b7fa8', '#2d3748', '#38a169', '#dd6b20', '#e53e3e'];
  let hash = 0;
  const str = user._id ? user._id.toString() : name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return {
    id: comment._id.toString(),
    authorId: user._id ? user._id.toString() : '',
    author: name,
    initials,
    avatarColor: color,
    verified: !!user.isVerified,
    createdAt: new Date(comment.createdAt).getTime(),
    updatedAt: comment.updatedAt ? new Date(comment.updatedAt).getTime() : null,
    text: comment.text,
    likes: comment.likes ? comment.likes.length : 0,
    dislikes: comment.dislikes ? comment.dislikes.length : 0,
    liked: currentUserId ? comment.likes.some(id => id.toString() === currentUserId.toString()) : false,
    disliked: currentUserId ? comment.dislikes.some(id => id.toString() === currentUserId.toString()) : false,
    deleted: !!comment.deleted,
    replies: comment.replies ? comment.replies.map(r => formatComment(r, currentUserId)) : []
  };
}

// GET /api/comments?placeId=...  — public (optional auth to show personal liked/disliked state)
exports.getAll = async (req, res, next) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ success: false, message: 'placeId query parameter is required' });
    }

    const currentUserId = req.user ? req.user.userId : null;

    const comments = await Comment.find({ destinationId: placeId, parentId: null })
      .populate('userId', 'name username isVerified avatar_url')
      .sort({ createdAt: -1 });

    const composedComments = await Promise.all(
      comments.map(async (c) => {
        const replies = await Comment.find({ parentId: c._id })
          .populate('userId', 'name username isVerified avatar_url')
          .sort({ createdAt: 1 });
        
        const cObj = c.toObject();
        cObj.replies = replies;
        return formatComment(cObj, currentUserId);
      })
    );

    res.json({ success: true, data: composedComments });
  } catch (err) {
    next(err);
  }
};

// POST /api/comments  — private
exports.create = async (req, res, next) => {
  try {
    const { placeId, text, parentId } = req.body;
    if (!placeId || !text) {
      return res.status(400).json({ success: false, message: 'placeId and text are required' });
    }

    const currentUserId = req.user.userId;

    const comment = await Comment.create({
      destinationId: placeId,
      userId: currentUserId,
      parentId: parentId || null,
      text,
    });

    const populated = await Comment.findById(comment._id).populate('userId', 'name username isVerified avatar_url');

    res.status(201).json({ success: true, data: formatComment(populated.toObject(), currentUserId) });
  } catch (err) {
    next(err);
  }
};

// POST /api/comments/:id/like  — private
exports.toggleLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const currentUserId = req.user.userId;
    const likeIndex = comment.likes.indexOf(currentUserId);
    const dislikeIndex = comment.dislikes.indexOf(currentUserId);

    if (likeIndex === -1) {
      comment.likes.push(currentUserId);
      if (dislikeIndex !== -1) {
        comment.dislikes.splice(dislikeIndex, 1);
      }
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    res.json({
      success: true,
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      liked: comment.likes.includes(currentUserId),
      disliked: comment.dislikes.includes(currentUserId),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/comments/:id/dislike  — private
exports.toggleDislike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const currentUserId = req.user.userId;
    const likeIndex = comment.likes.indexOf(currentUserId);
    const dislikeIndex = comment.dislikes.indexOf(currentUserId);

    if (dislikeIndex === -1) {
      comment.dislikes.push(currentUserId);
      if (likeIndex !== -1) {
        comment.likes.splice(likeIndex, 1);
      }
    } else {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    await comment.save();
    res.json({
      success: true,
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      liked: comment.likes.includes(currentUserId),
      disliked: comment.dislikes.includes(currentUserId),
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/comments/:id  — private
exports.update = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }

    const comment = await Comment.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });

    comment.text = text;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('userId', 'name username isVerified avatar_url');
    res.json({ success: true, data: formatComment(populated.toObject(), req.user.userId) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id  — private
exports.remove = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });

    comment.deleted = true;
    await comment.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};
