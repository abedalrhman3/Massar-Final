import client from './client';



export const getEvents = (params) =>
    client.get('/events', { params });



export const getEvent = (id) =>
    client.get(`/events/${id}`);










export const createEvent = (formData) =>
    client.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });




export const updateEvent = (id, formData) =>
    client.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });



export const deleteEvent = (id) =>
    client.delete(`/events/${id}`);