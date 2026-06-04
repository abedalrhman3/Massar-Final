import client from './client';

// GET /api/achievements  — public
// returns: { success, data: Achievement[] }
export const getAchievements = () =>
    client.get('/achievements');

// GET /api/achievements/me  — requires auth
// returns: { success, data: UserAchievement[] }  with populated achievementId
export const getMyAchievements = () =>
    client.get('/achievements/me');

// ── Admin ─────────────────────────────────────────────

// POST /api/achievements  — admin
// body: { name, triggerType: 'visit_count'|'save_count'|'review_count'|'login_streak'|'custom', triggerValue: number }
// returns: { success, data: Achievement }
export const createAchievement = (data) =>
    client.post('/achievements', data);