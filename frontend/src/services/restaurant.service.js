import { apiClient } from './apiClient';

const BASE_URL = import.meta.env.VITE_RESTAURANT_API || 'http://localhost:5002/api';

export const restaurantService = {
  async getRestaurants({ search = '', cuisine = '', status = '' } = {}, signal) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (cuisine && cuisine !== 'All') params.append('cuisine', cuisine);
    if (status) params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient(`${BASE_URL}/restaurants${query}`, { signal });
  },

  async getRestaurantById(id, signal) {
    return await apiClient(`${BASE_URL}/restaurants/${id}`, { signal });
  },

  async getMyRestaurant(signal) {
    return await apiClient(`${BASE_URL}/restaurants/my-restaurant`, { signal });
  },

  async createRestaurant(restaurantData) {
    return await apiClient(`${BASE_URL}/restaurants`, {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    });
  },

  async updateRestaurant(id, updateData) {
    return await apiClient(`${BASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  async toggleStatus(id) {
    return await apiClient(`${BASE_URL}/restaurants/${id}/status`, {
      method: 'PATCH',
    });
  },

  async deleteRestaurant(id) {
    return await apiClient(`${BASE_URL}/restaurants/${id}`, {
      method: 'DELETE',
    });
  },

  async getMenu(restaurantId, signal) {
    return await apiClient(`${BASE_URL}/menu/restaurant/${restaurantId}`, { signal });
  },

  async addMenuItem(restaurantId, itemData) {
    return await apiClient(`${BASE_URL}/menu/restaurant/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async updateMenuItem(itemId, itemData) {
    return await apiClient(`${BASE_URL}/menu/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  async deleteMenuItem(itemId) {
    return await apiClient(`${BASE_URL}/menu/item/${itemId}`, {
      method: 'DELETE',
    });
  },
};
