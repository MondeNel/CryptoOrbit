import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Silent token refresh on 401
let refreshPromise = null;

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);
    orig._retry = true;

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refresh = localStorage.getItem('refresh_token');
          if (!refresh) throw new Error('no refresh token');
          const { data } = await axios.post('/api/auth/refresh', { refresh_token: refresh });
          localStorage.setItem('access_token',  data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        } finally {
          refreshPromise = null;
        }
      })();
    }

    try {
      await refreshPromise;
      orig.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      return api(orig);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(err);
    }
  }
);

export default api;