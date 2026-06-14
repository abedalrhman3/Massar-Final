import client from './client';



export const getSavedItems = () =>
    client.get('/saved');





export const saveItem = (entityType, entityId) =>
    client.post('/saved', { entityType, entityId });



export const removeSavedItem = (id) =>
    client.delete(`/saved/${id}`);