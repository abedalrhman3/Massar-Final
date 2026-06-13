import client from './client';

// GET /api/photos/:id  — public (user's gallery / community feed)
export const getPublicPhotos = (id) =>
    client.get(`/photos/${id}`);

// PUT /api/photos/:id/privacy  — requires auth (owner only)
// Toggles is_private on the photo
export const togglePhotoPrivacy = (id) =>
    client.put(`/photos/${id}/privacy`);

// POST /api/photos/:id/report  — requires auth (manual user report)
export const reportPhoto = (id) =>
    client.post(`/photos/${id}/report`);

// ── Admin ──────────────────────────────────────────────

// GET /api/photos/reported  — admin
// Returns AI-flagged (pending_review) + manually reported photos
export const getReportedPhotos = () =>
    client.get('/photos/reported');

// PUT /api/admin/photos/:id/review  — admin
// decision: 'approve' | 'reject'
// approve → quest completed + XP/badge awarded to user
// reject  → photo permanently deleted from Cloudinary + DB
export const reviewPhoto = (id, decision) =>
    client.put(`/admin/photos/${id}/review`, { decision });

// DELETE /api/photos/:id  — admin (hard delete any photo)
export const deletePhoto = (id) =>
    client.delete(`/photos/${id}`);