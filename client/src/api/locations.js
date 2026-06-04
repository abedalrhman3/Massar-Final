import client from './client';

// GET /api/locations?budgetCategory=Low|Medium|High|All  — public
// NOTE: returns a plain array (not { success, data }), e.g. res.data = Location[]
export const getLocations = (params) =>
    client.get('/locations', { params });

// GET /api/locations/:id  — public
// returns: { success, data: Location }
export const getLocation = (id) =>
    client.get(`/locations/${id}`);

// GET /api/locations/:locationId/posts  — public
// returns: { success, data: Post[] }
export const getLocationPosts = (locationId) =>
    client.get(`/locations/${locationId}/posts`);

// POST /api/locations/:locationId/posts  — requires auth
// body: { content, image_url?, rating? }
// returns: { success, data: Post }
export const createPost = (locationId, data) =>
    client.post(`/locations/${locationId}/posts`, data);

// POST /api/locations/:locationId/complete-task  — requires auth, multipart/form-data
// fields: taskIndex (number), userLat (number), userLng (number), photo (file, optional)
// returns: { success, message, xpGained, ...gameResult, photo? }
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

// ── Admin ─────────────────────────────────────────────

// POST /api/locations  — admin
// body: { name, name_en, description?, coordinates: {lat,lng}, xp_reward?, badge_id?, tasks? }
// returns: { success, data: Location }
export const createLocation = (data) =>
    client.post('/locations', data);

// PUT /api/locations/:id  — admin
// returns: { success, data: Location }
export const updateLocation = (id, data) =>
    client.put(`/locations/${id}`, data);

// DELETE /api/locations/:id  — admin
// returns: { success, message }
export const deleteLocation = (id) =>
    client.delete(`/locations/${id}`);