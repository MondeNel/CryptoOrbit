import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// attach access token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// on 401 — try refresh, replay original request once
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) throw new Error('no refresh token');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`,
          { refresh_token }
        );
        localStorage.setItem('access_token',  data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
      }
    }
    return Promise.reject(err);
  }
);

export default api;