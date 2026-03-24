import axios from 'axios';

// file:// protocol (Electron) has empty hostname — fallback to localhost
const hostname = window.location.hostname || 'localhost';
// When served over HTTPS (port 8080 with serve.cjs proxy), use /api prefix
// to avoid Mixed Content browser block. Otherwise call backend directly.
const isHttps = window.location.protocol === 'https:';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || (isHttps ? '/api' : `http://${hostname}:3000`),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


