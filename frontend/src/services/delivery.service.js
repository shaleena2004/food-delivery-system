import { apiClient } from './apiClient';

const DELIVERY_URL = import.meta.env.VITE_DELIVERY_API || 'http://localhost:5004/api/deliveries';

export const deliveryService = {
  async getAvailableDeliveries(signal) {
    return await apiClient(`${DELIVERY_URL}/available`, { signal });
  },

  async getMyDeliveries(signal) {
    return await apiClient(`${DELIVERY_URL}/my-deliveries`, { signal });
  },

  async getDeliveryById(id, signal) {
    return await apiClient(`${DELIVERY_URL}/${id}`, { signal });
  },

  async getDeliveryByOrderId(orderId, signal) {
    return await apiClient(`${DELIVERY_URL}/order/${orderId}`, { signal });
  },

  async acceptDelivery(id) {
    return await apiClient(`${DELIVERY_URL}/${id}/accept`, {
      method: 'PATCH',
    });
  },

  async updateDeliveryStatus(id, status, notes = '') {
    return await apiClient(`${DELIVERY_URL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },
};
