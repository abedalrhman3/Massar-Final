import client from './client';

// GET /api/events?destinationId=...&categoryId=...  — public
// returns: { success, data: Event[] }  sorted by startDate asc
export const getEvents = (params) =>
    client.get('/events', { params });

// GET /api/events/:id  — public
// returns: { success, data: Event }
export const getEvent = (id) =>
    client.get(`/events/${id}`);

// ── Admin ─────────────────────────────────────────────

// POST /api/events  — admin, multipart/form-data
// fields: name, destinationId, categoryId, customOverview,
//         startDate, startTime(JSON), endDate, endTime(JSON),
//         startingFromPrice, durationText, bookingUrl,
//         location(JSON), contact(JSON), isPublished,
//         coverImage (file, required), images (files, up to 10)
// returns: { success, data: Event }
export const createEvent = (formData) =>
    client.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// PUT /api/events/:id  — admin, multipart/form-data
// same fields as create (all optional)
// returns: { success, data: Event }
export const updateEvent = (id, formData) =>
    client.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// DELETE /api/events/:id  — admin
// returns: { success, message }
export const deleteEvent = (id) =>
    client.delete(`/events/${id}`);