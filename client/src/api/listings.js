import client from './client';

// ─────────────────────────────────────────────────────
// Places, Restaurants, and Hotels all share the same
// route/controller shape (listingController + listingRouter).
// This file exports a factory so you don't repeat yourself.
// ─────────────────────────────────────────────────────

const createListingApi = (resource) => ({

    // GET /api/<resource>?destinationId=...&categoryId=... — public
    // params should be a flat object: { destinationId: '...', categoryId: '...' }
    getAll: (params) =>
        client.get(`/${resource}`, { params }),

    // GET /api/<resource>/:id — public
    getOne: (id) =>
        client.get(`/${resource}/${id}`),

    // POST /api/<resource> — admin, multipart/form-data
    create: (formData) =>
        client.post(`/${resource}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // PUT /api/<resource>/:id — admin, multipart/form-data
    update: (id, formData) =>
        client.put(`/${resource}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // DELETE /api/<resource>/:id — admin
    remove: (id) =>
        client.delete(`/${resource}/${id}`),
});

export const placesApi = createListingApi('places');
export const restaurantsApi = createListingApi('restaurants');
export const hotelsApi = createListingApi('hotels');