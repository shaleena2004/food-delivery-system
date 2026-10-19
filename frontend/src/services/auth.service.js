import { apiClient } from './apiClient';

const AUTH_URL = import.meta.env.VITE_AUTH_API || 'http://localhost:5001/api/auth';

export const authService = {
  async register(userData) {
    return await apiClient(`${AUTH_URL}/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials) {
    return await apiClient(`${AUTH_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getProfile(signal) {
    return await apiClient(`${AUTH_URL}/me`, { signal });
  },

  async getAllUsers(signal) {
    return await apiClient(`${AUTH_URL}/users`, { signal });
  },

  async updateUserStatus(userId, status) {
    return await apiClient(`${AUTH_URL}/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async createUserByAdmin(userData) {
    return await apiClient(`${AUTH_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async resetPassword({ email, newPassword }) {
    return await apiClient(`${AUTH_URL}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },
};
