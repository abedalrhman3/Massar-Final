import axios from 'axios';
import storage from '../utils/storage';

// ← غيّر هذا إلى IP جهازك: ipconfig في Windows ثم ابحث عن IPv4
// في الإنتاج: 'https://your-domain.com'
export const BASE_URL = 'https://4cd17d71473b96.lhr.life'; // Direct Local IP
// export const BASE_URL = 'http://192.168.1.x:5000'; // جهاز حقيقي

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  try {
    // Bypass localtunnel anti-phishing reminder page for API requests
    config.headers['Bypass-Tunnel-Reminder'] = 'true';

    const user = await storage.getItem('massair_user');
    if (user) {
      const parsed = JSON.parse(user);
      config.headers['x-user-id'] = parsed._id;
      if (parsed.token) {
        config.headers['Authorization'] = `Bearer ${parsed.token}`;
      }
    }
  } catch (_) { }
  return config;
});

export default api;
