const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');


exports.getAll = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};


exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return next(new AppError('Notification not found', 404));
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};


exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.userId }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
