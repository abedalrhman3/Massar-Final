import client from './client';

// GET /api/notifications  — requires auth
// returns: { success, data: Notification[] }  sorted newest first
export const getNotifications = () =>
    client.get('/notifications');

// PUT /api/notifications/read-all  — requires auth
// returns: { success, message }
export const markAllNotificationsRead = () =>
    client.put('/notifications/read-all');

// PUT /api/notifications/:id/read  — requires auth
// returns: { success, data: Notification }
export const markNotificationRead = (id) =>
    client.put(`/notifications/${id}/read`);