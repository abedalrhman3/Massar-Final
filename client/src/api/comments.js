import client from './client';


export const getComments = (placeId) =>
    client.get('/comments', { params: { placeId } });


export const createComment = (placeId, text, parentId = null) =>
    client.post('/comments', { placeId, text, ...(parentId && { parentId }) });


export const likeComment = (id) =>
    client.post(`/comments/${id}/like`);


export const dislikeComment = (id) =>
    client.post(`/comments/${id}/dislike`);


export const updateComment = (id, text) =>
    client.patch(`/comments/${id}`, { text });


export const deleteComment = (id) =>
    client.delete(`/comments/${id}`);
