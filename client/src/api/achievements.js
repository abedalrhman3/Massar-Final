import client from './client';



export const getAchievements = () =>
    client.get('/achievements');



export const getMyAchievements = () =>
    client.get('/achievements/me');






export const createAchievement = (data) =>
    client.post('/achievements', data);