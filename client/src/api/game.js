import client from './client';

// GET /api/game/leaderboard  — public
// returns: { success, data: User[] }  top 10 by total_xp
export const getLeaderboard = () =>
    client.get('/game/leaderboard');

// GET /api/game/users/:id/profile  — public
// returns: { success, data: User }  with populated badges, locations, quests
export const getUserProfile = (id) =>
    client.get(`/game/users/${id}/profile`);

// POST /api/game/user/update-frame  — requires auth
// body: { frameSlug: string }
// returns: { success, active_frame_slug }
export const updateFrame = (frameSlug) =>
    client.post('/game/user/update-frame', { frameSlug });

// ── Admin ─────────────────────────────────────────────

// POST /api/game/admin/upload-asset  — admin, multipart/form-data
// fields: asset (file)
// returns: { success, fileUrl }
export const uploadAsset = (file) => {
    const formData = new FormData();
    formData.append('asset', file);
    return client.post('/game/admin/upload-asset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};