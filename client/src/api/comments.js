import client from './client';

// GET /api/comments?placeId=...  — public
export const getComments = (placeId) =>
    client.get('/comments', { params: { placeId } });

// POST /api/comments  — private
export const createComment = (placeId, text, parentId = null) =>
    client.post('/comments', { placeId, text, ...(parentId && { parentId }) });

// POST /api/comments/:id/like  — private
export const likeComment = (id) =>
    client.post(`/comments/${id}/like`);

// POST /api/comments/:id/dislike  — private
export const dislikeComment = (id) =>
    client.post(`/comments/${id}/dislike`);

// PATCH /api/comments/:id  — private
export const updateComment = (id, text) =>
    client.patch(`/comments/${id}`, { text });

// DELETE /api/comments/:id  — private
export const deleteComment = (id) =>
    client.delete(`/comments/${id}`);
