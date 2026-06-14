import client from './client';


export const getPublicPhotos = (id) =>
    client.get(`/photos/${id}`);



export const togglePhotoPrivacy = (id) =>
    client.put(`/photos/${id}/privacy`);


export const reportPhoto = (id) =>
    client.post(`/photos/${id}/report`);





export const getReportedPhotos = () =>
    client.get('/photos/reported');





export const reviewPhoto = (id, decision) =>
    client.put(`/admin/photos/${id}/review`, { decision });


export const deletePhoto = (id) =>
    client.delete(`/photos/${id}`);