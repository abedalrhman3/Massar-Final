import client from './client';

// GET /api/categories  — public
// returns: { success, data: Category[] }
export const getCategories = () =>
    client.get('/categories');

// ── Admin ─────────────────────────────────────────────

// POST /api/categories  — admin
// body: { name, type: 'place'|'restaurant'|'hotel'|'event', icon? }
// returns: { success, data: Category }
export const createCategory = (data) =>
    client.post('/categories', data);

// PUT /api/categories/:id  — admin
// body: { name?, type?, icon? }
// returns: { success, data: Category }
export const updateCategory = (id, data) =>
    client.put(`/categories/${id}`, data);

// DELETE /api/categories/:id  — admin
// returns: { success, message }
export const deleteCategory = (id) =>
    client.delete(`/categories/${id}`);