import client from './client';



export const getLeaderboard = () =>
    client.get('/game/leaderboard');



export const getUserProfile = (id) =>
    client.get(`/game/users/${id}/profile`);




export const updateFrame = (frameSlug) =>
    client.post('/game/user/update-frame', { frameSlug });






export const uploadAsset = (file) => {
    const formData = new FormData();
    formData.append('asset', file);
    return client.post('/game/admin/upload-asset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};