import client from './client';







const createListingApi = (resource) => ({

    
    
    getAll: (params) =>
        client.get(`/${resource}`, { params }),

    
    getOne: (id) =>
        client.get(`/${resource}/${id}`),

    
    create: (formData) =>
        client.post(`/${resource}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    
    update: (id, formData) =>
        client.put(`/${resource}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    
    remove: (id) =>
        client.delete(`/${resource}/${id}`),
});

export const placesApi = createListingApi('places');
export const restaurantsApi = createListingApi('restaurants');
export const hotelsApi = createListingApi('hotels');