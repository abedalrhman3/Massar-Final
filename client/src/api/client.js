import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL;
console.log("API base:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  withCredentials: true, // send HTTPOnly cookie on every request
});

api.interceptors.request.use((config) => {
  // Strip localtunnel's anti-phishing interstitial in dev
  if (import.meta.env.DEV) {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
  }
  return config;
});

export default api;