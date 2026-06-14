import client from './client';






export const getBudgetSettings = () =>
    client.get('/admin/settings/budget');




export const updateBudgetSettings = (data) =>
    client.post('/admin/settings/budget', data);



export const getReportedPhotos = () =>
    client.get('/admin/reported-photos');

export const deletePhoto = (id) =>
    client.delete(`/admin/photos/${id}`);



export const reviewPhoto = (id, decision, reason, deletePhoto, banUser) =>
    client.put(`/admin/photos/${id}/review`, { decision, reason, deletePhoto, banUser });




export const adminCreateLocation = (data) =>
    client.post('/admin/add-location', data);



export const adminDeleteLocation = (id) =>
    client.delete(`/admin/locations/${id}`);




export const adminCreateQuest = (data) =>
    client.post('/admin/add-quest', data);



export const adminDeleteQuest = (id) =>
    client.delete(`/admin/quests/${id}`);




export const uploadAsset = (file) => {
    const formData = new FormData();
    formData.append('asset', file);
    return client.post('/admin/upload-asset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};