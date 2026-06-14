import client from './client';



export const getLocations = (params) =>
    client.get('/locations', { params });



export const getLocation = (id) =>
    client.get(`/locations/${id}`);



export const getLocationPosts = (locationId) =>
    client.get(`/locations/${locationId}/posts`);




export const createPost = (locationId, data) =>
    client.post(`/locations/${locationId}/posts`, data);




export const completeTask = (locationId, data) => {
    const formData = new FormData();
    formData.append('taskIndex', data.taskIndex ?? 0);
    if (data.userLat != null) formData.append('userLat', data.userLat);
    if (data.userLng != null) formData.append('userLng', data.userLng);
    if (data.photo) formData.append('photo', data.photo);

    return client.post(`/locations/${locationId}/complete-task`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};






export const createLocation = (data) =>
    client.post('/locations', data);



export const updateLocation = (id, data) =>
    client.put(`/locations/${id}`, data);



export const deleteLocation = (id) =>
    client.delete(`/locations/${id}`);