const Notification = require('../models/Notification');





const sendNotification = async (userId, type, title, body) => {
  return await Notification.create({ userId, type, title, body, isRead: false });
};




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
