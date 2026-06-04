import client from './client';

// GET /api/destinations  — public (admin sees unpublished too)
// returns: { success, data: Destination[] }
export const getDestinations = () =>
    client.get('/destinations');

// GET /api/destinations/:slug  — public
// returns: { success, data: Destination }
export const getDestination = (slug) =>
    client.get(`/destinations/${slug}`);

// GET /api/destinations/:id/details  — public
// returns: { success, data: DestinationDetail }
export const getDestinationDetails = (id) =>
    client.get(`/destinations/${id}/details`);

// ── Admin ─────────────────────────────────────────────

// POST /api/destinations  — admin, multipart/form-data
// fields: name(string), budget(number), isPublished(bool), image(file), location(JSON string)
// returns: { success, data: Destination }
export const createDestination = (formData) =>
    client.post('/destinations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// PUT /api/destinations/:id  — admin, multipart/form-data
// same fields as create (all optional)
// returns: { success, data: Destination }
export const updateDestination = (id, formData) =>
    client.put(`/destinations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// PUT /api/destinations/:id/details  — admin, JSON
// body: { overview: {...}, activities: [...], guideSections: [...] }
// returns: { success, data: DestinationDetail }
export const updateDestinationDetails = (id, data) =>
    client.put(`/destinations/${id}/details`, data);

// DELETE /api/destinations/:id  — admin
// returns: { success, message }
export const deleteDestination = (id) =>
    client.delete(`/destinations/${id}`);