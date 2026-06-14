import client from './client';




export const register = (data) =>
    client.post('/auth/register', data);




export const login = (data) =>
    client.post('/auth/login', data);



export const logout = () =>
    client.post('/auth/logout');



export const getMe = () =>
    client.get('/auth/me');



export const verifyEmail = (token) =>
    client.get(`/auth/verify-email/${token}`);




export const forgotPassword = (email) =>
    client.post('/auth/forgot-password', { email });




export const resetPassword = (token, password) =>
    client.post(`/auth/reset-password/${token}`, { password });


export const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
};




export const getAllUsers = () =>
    client.get('/auth/users');


export const getUser = (id) =>
    client.get(`/auth/users/${id}`);


export const deleteUser = (id) =>
    client.delete(`/auth/users/${id}`);


export const toggleBanUser = (id) =>
    client.put(`/auth/users/${id}/ban`);