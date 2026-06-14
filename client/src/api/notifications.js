import client from './client';



export const getNotifications = () =>
    client.get('/notifications');



export const markAllNotificationsRead = () =>
    client.put('/notifications/read-all');



export const markNotificationRead = (id) =>
    client.put(`/notifications/${id}/read`);