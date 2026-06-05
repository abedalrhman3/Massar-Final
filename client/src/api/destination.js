import client from './client';

// GET /api/destinations — public
export const getDestinations = () =>
    client.get('/destinations');

// GET /api/destinations/:slug — public
export const getDestination = (slug) =>
    client.get(`/destinations/${slug}`);

// GET /api/destinations/details/:id — public
export const getDestinationDetails = (id) =>
    client.get(`/destinations/details/${id}`); // Swapped structure

// POST /api/destinations/:id/like — authenticated
export const toggleLikeDestination = (id) =>
    client.post(`/destinations/${id}/like`);

// ── Admin ─────────────────────────────────────────────

// POST /api/destinations — admin, multipart/form-data
export const createDestination = (formData) =>
    client.post('/destinations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// 1. Keeps FormData intact for image files
// PUT /api/destinations/:id — admin, multipart/form-data
export const updateDestination = (id, formData) =>
    client.put(`/destinations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// 2. Keeps pure raw JSON object data intact for guide text updates
// PUT /api/destinations/details/:id — admin, JSON
export const updateDestinationDetails = (id, data) =>
    client.put(`/destinations/details/${id}`, data); // Swapped structure

// DELETE /api/destinations/:id — admin
export const deleteDestination = (id) =>
    client.delete(`/destinations/${id}`);