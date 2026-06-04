import client from './client';

// GET /api/saved  — requires auth
// returns: { success, data: SavedItem[] }
export const getSavedItems = () =>
    client.get('/saved');

// POST /api/saved  — requires auth
// body: { entityType: 'place'|'restaurant'|'hotel'|'event'|'destination', entityId: string }
// returns: { success, data: SavedItem }
// throws 400 if already saved (duplicate)
export const saveItem = (entityType, entityId) =>
    client.post('/saved', { entityType, entityId });

// DELETE /api/saved/:id  — requires auth (owner only)
// returns: { success, message }
export const removeSavedItem = (id) =>
    client.delete(`/saved/${id}`);