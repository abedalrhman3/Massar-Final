import client from './client';


export const getDestinations = () =>
    client.get('/destinations');


export const getDestination = (slug) =>
    client.get(`/destinations/${slug}`);


export const getDestinationDetails = (id) =>
    client.get(`/destinations/details/${id}`); 


export const toggleLikeDestination = (id) =>
    client.post(`/destinations/${id}/like`);




export const createDestination = (formData) =>
    client.post('/destinations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });



export const updateDestination = (id, formData) =>
    client.put(`/destinations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });



export const updateDestinationDetails = (id, data) =>
    client.put(`/destinations/details/${id}`, data); 


export const deleteDestination = (id) =>
    client.delete(`/destinations/${id}`);