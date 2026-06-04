import client from './client';

// GET /api/photos  — public (community feed)
// NOTE: returns a plain array (not { success, data }), e.g. res.data = Photo[]
export const getPublicPhotos = () =>
    client.get('/photos');

// PUT /api/photos/:id/privacy  — requires auth (owner only)
// Toggles is_private on the photo
// returns: { success, data: Photo }
export const togglePhotoPrivacy = (id) =>
    client.put(`/photos/${id}/privacy`);

// POST /api/photos/:id/report  — requires auth
// returns: { success, message }
export const reportPhoto = (id) =>
    client.post(`/photos/${id}/report`);

// ── Admin ─────────────────────────────────────────────

// GET /api/photos/reported  — admin
// returns: { success, data: Photo[] }
export const getReportedPhotos = () =>
    client.get('/photos/reported');

// DELETE /api/photos/:id  — admin
// returns: { success, message }
export const deletePhoto = (id) =>
    client.delete(`/photos/${id}`);