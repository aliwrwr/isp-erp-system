import { defineStore } from 'pinia';
import api from '../api';

interface User {
  id: number;
  name: string;
  email: string;
  roles: { id: number; name: string }[];
  employee: {
    id: number;
    name: string;
    department: {
      id: number;
      name: string;
      permissions: string[];
    } | null;
  } | null;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  currentSystem: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    currentSystem: localStorage.getItem('currentSystem'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
    isSuperAdmin: (state) => state.user?.permissions?.includes('*') || false,
    permissions: (state) => state.user?.permissions || [],
    hasPermission() {
      return (perm: string) => {
        if (this.isSuperAdmin) return true;
        return this.permissions.includes(perm);
      };
    },
    hasSystemAccess() {
      return (system: string) => {
        if (this.isSuperAdmin) return true;
        return this.permissions.some((p: string) => p.startsWith(system + '.'));
      };
    },
  },
  actions: {
    async login(email: string, password: string) {
      const { data } = await api.post('/auth/login', { email, password });
      this.token = data.access_token;
      localStorage.setItem('token', data.access_token);
      // Fetch user profile with permissions after login
      try {
        const profile = await api.get('/auth/profile');
        this.user = profile.data;
        localStorage.setItem('user', JSON.stringify(profile.data));
      } catch {
        // Fallback if profile fails
      }
    },
    setSystem(system: string) {
      this.currentSystem = system;
      localStorage.setItem('currentSystem', system);
    },
    async refreshProfile() {
      try {
        const profile = await api.get('/auth/profile');
        this.user = profile.data;
        localStorage.setItem('user', JSON.stringify(profile.data));
      } catch {
        // silently fail — keep existing user data
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.currentSystem = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentSystem');
    },
  },
});
