import client from './client';

// ─────────────────────────────────────────────────────
// Places, Restaurants, and Hotels all share the same
// route/controller shape (listingController + listingRouter).
// This file exports a factory so you don't repeat yourself.
//
// Usage:
//   import { placesApi } from './listings';
//   placesApi.getAll({ destinationId: '...' });
// ─────────────────────────────────────────────────────

const createListingApi = (resource) => ({

    // GET /api/<resource>?destinationId=...&categoryId=...  — public
    // returns: { success, data: Item[] }
    getAll: (params) =>
        client.get(`/${resource}`, { params }),

    // GET /api/<resource>/:id  — public
    // returns: { success, data: Item }
    getOne: (id) =>
        client.get(`/${resource}/${id}`),

    // POST /api/<resource>  — admin, multipart/form-data
    // fields: name, destinationId, categoryId, customOverview, bookingUrl,
    //         contact (JSON string), location (JSON string),
    //         isPublished, coverImage (file), images (files, up to 10)
    // returns: { success, data: Item }
    create: (formData) =>
        client.post(`/${resource}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // PUT /api/<resource>/:id  — admin, multipart/form-data
    // same fields as create (all optional)
    // returns: { success, data: Item }
    update: (id, formData) =>
        client.put(`/${resource}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // DELETE /api/<resource>/:id  — admin
    // returns: { success, message }
    remove: (id) =>
        client.delete(`/${resource}/${id}`),
});

export const placesApi = createListingApi('places');
export const restaurantsApi = createListingApi('restaurants');
export const hotelsApi = createListingApi('hotels');