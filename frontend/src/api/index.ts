import axios from 'axios';

const hostname = window.location.hostname || 'localhost';
const currentOrigin = window.location.origin;
const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

const api = axios.create({
  baseURL:
    envApiUrl ||
    (isLocalhost ? `http://${hostname}:3000` : currentOrigin),
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


