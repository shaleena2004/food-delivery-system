import { apiClient } from './apiClient';

const CUSTOMER_URL = import.meta.env.VITE_CUSTOMER_API || 'http://localhost:5005/api/customers';

export const customerService = {
  async getProfile(signal) {
    return await apiClient(`${CUSTOMER_URL}/profile`, { signal });
  },

  async updateProfile(profileData) {
    return await apiClient(`${CUSTOMER_URL}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async getAddresses(signal) {
    return await apiClient(`${CUSTOMER_URL}/addresses`, { signal });
  },

  async addAddress(addressData) {
    return await apiClient(`${CUSTOMER_URL}/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  async updateAddress(id, addressData) {
    return await apiClient(`${CUSTOMER_URL}/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  async deleteAddress(id) {
    return await apiClient(`${CUSTOMER_URL}/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  async setDefaultAddress(id) {
    return await apiClient(`${CUSTOMER_URL}/addresses/${id}/default`, {
      method: 'PATCH',
    });
  },
};
