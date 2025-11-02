import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/users/register/', userData);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/token/', credentials);
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await api.post('/users/logout/', { refresh: refreshToken });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  async getProfile() {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/users/profile/', data);
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};