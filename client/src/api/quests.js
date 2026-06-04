import client from './client';

// GET /api/quests  — public
// returns: { success, data: Quest[] }  with populated locations
export const getQuests = () =>
    client.get('/quests');

// GET /api/quests/:id  — public
// returns: { success, data: Quest }
export const getQuest = (id) =>
    client.get(`/quests/${id}`);

// ── Admin ─────────────────────────────────────────────

// POST /api/quests  — admin
// body: { title, title_en?, description?, locations: [id], bonus_xp?, title_reward?, badge_url?, icon_url?, start_coordinates? }
// returns: { success, data: Quest }
export const createQuest = (data) =>
    client.post('/quests', data);

// PUT /api/quests/:id  — admin
// returns: { success, data: Quest }
export const updateQuest = (id, data) =>
    client.put(`/quests/${id}`, data);

// DELETE /api/quests/:id  — admin
// returns: { success, message }
export const deleteQuest = (id) =>
    client.delete(`/quests/${id}`);