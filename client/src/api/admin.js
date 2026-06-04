import client from './client';

// All endpoints here require auth + admin role.
// The protect + adminOnly middleware is applied at the router level.

// GET /api/admin/settings/budget
// returns: { low_max, mid_max }  (direct object, no success wrapper)
export const getBudgetSettings = () =>
    client.get('/admin/settings/budget');

// POST /api/admin/settings/budget
// body: { low_max?: number, mid_max?: number }
// returns: { success, budget_ranges: { low_max, mid_max } }
export const updateBudgetSettings = (data) =>
    client.post('/admin/settings/budget', data);

// GET /api/admin/reported-photos
// returns: { success, data: Photo[] }
export const getReportedPhotos = () =>
    client.get('/admin/reported-photos');

// DELETE /api/admin/photos/:id
// returns: { success, message }
export const deletePhoto = (id) =>
    client.delete(`/admin/photos/${id}`);

// POST /api/admin/add-location
// body: Location fields
// returns: { success, data: Location }
export const adminCreateLocation = (data) =>
    client.post('/admin/add-location', data);

// DELETE /api/admin/locations/:id
// returns: { success, message }
export const adminDeleteLocation = (id) =>
    client.delete(`/admin/locations/${id}`);

// POST /api/admin/add-quest
// body: Quest fields
// returns: { success, data: Quest }
export const adminCreateQuest = (data) =>
    client.post('/admin/add-quest', data);

// DELETE /api/admin/quests/:id
// returns: { success, message }
export const adminDeleteQuest = (id) =>
    client.delete(`/admin/quests/${id}`);

// POST /api/admin/upload-asset  — multipart/form-data
// fields: asset (file)
// returns: { success, fileUrl }
export const uploadAsset = (file) => {
    const formData = new FormData();
    formData.append('asset', file);
    return client.post('/admin/upload-asset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};