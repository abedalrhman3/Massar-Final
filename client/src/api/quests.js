import client from './client';



export const getAllQuests = () =>
    client.get('/quests');

export const getLocationQuests = (locationId) =>
    client.get(`/quests/location/${locationId}`);



export const getQuest = (id) =>
    client.get(`/quests/${id}`);



export const joinQuest = (id, formData) =>
    client.post(`/quests/${id}/join`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });






export const createQuest = (data) =>
    client.post('/quests', data);



export const updateQuest = (id, data) =>
    client.put(`/quests/${id}`, data);



export const deleteQuest = (id) =>
    client.delete(`/quests/${id}`);