import client from './client';

// POST /api/auth/register
// body: { name, email, password }
// returns: { success, token, user }
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

// Google OAuth — redirects to backend, which handles the full handshake
// and sets the cookie before redirecting back to VITE_APP_URL
export const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};

// ── Admin ─────────────────────────────────────────────

// GET /api/auth/users  — admin
// returns: { success, data: User[] }
export const getAllUsers = () =>
    client.get('/auth/users');

// GET /api/auth/users/:id  — admin
// returns: { success, user }
export const getUser = (id) =>
    client.get(`/auth/users/${id}`);

// DELETE /api/auth/users/:id  — admin
// returns: { success, message }
export const deleteUser = (id) =>
    client.delete(`/auth/users/${id}`);

// PUT /api/auth/users/:id/ban  — admin
// returns: { success, message, isBanned }
export const toggleBanUser = (id) =>
    client.put(`/auth/users/${id}/ban`);