const Notification = require('../models/Notification');

// -------------------------------------------------------
// Send a notification to a user
// Call this from anywhere in the app
// -------------------------------------------------------
const sendNotification = async (userId, type, title, body) => {
  return await Notification.create({ userId, type, title, body, isRead: false });
};

// -------------------------------------------------------
// Send the same notification to multiple users at once
// -------------------------------------------------------
const sendBulkNotification = async (userIds, type, title, body) => {
  const notifications = userIds.map((userId) => ({
    userId,
    type,
    title,
    body,
    isRead: false,
  }));
  return await Notification.insertMany(notifications);
};

module.exports = { sendNotification, sendBulkNotification };
