import client from './client';

// POST /api/auth/register
// body: { name, email, password }
// returns: { success, message, user }
export const register = (data) =>
    client.post('/auth/register', data);

// POST /api/auth/login
// body: { email, password }
// returns: { success, token, user }
export const login = (data) =>
    client.post('/auth/login', data);

// POST /api/auth/logout  — requires auth
// returns: { success, message }
export const logout = () =>
    client.post('/auth/logout');

// GET /api/auth/me  — requires auth
// returns: { success, user }
export const getMe = () =>
    client.get('/auth/me');

// GET /api/auth/verify-email/:token  — public
// returns: { success, message }
export const verifyEmail = (token) =>
    client.get(`/auth/verify-email/${token}`);

// POST /api/auth/forgot-password  — public
// body: { email }
// returns: { success, message }  (always 200 to prevent enumeration)
export const forgotPassword = (email) =>
    client.post('/auth/forgot-password', { email });

// POST /api/auth/reset-password/:token  — public
// body: { password }
// returns: { success, message }
export const resetPassword = (token, password) =>
    client.post(`/auth/reset-password/${token}`, { password });

// Google OAuth — redirects to backend which sets cookie then redirects to VITE_APP_URL
export const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
};

// ── Admin ─────────────────────────────────────────────────────────────────────

// GET /api/auth/users  — admin
export const getAllUsers = () =>
    client.get('/auth/users');

// GET /api/auth/users/:id  — admin
export const getUser = (id) =>
    client.get(`/auth/users/${id}`);

// DELETE /api/auth/users/:id  — admin
export const deleteUser = (id) =>
    client.delete(`/auth/users/${id}`);

// PUT /api/auth/users/:id/ban  — admin
export const toggleBanUser = (id) =>
    client.put(`/auth/users/${id}/ban`);