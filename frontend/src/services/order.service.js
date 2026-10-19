import { apiClient } from './apiClient';

const ORDER_URL = import.meta.env.VITE_ORDER_API || 'http://localhost:5003/api/orders';

export const orderService = {
  async createOrder(orderPayload) {
    return await apiClient(`${ORDER_URL}`, {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getMyOrders(signal) {
    return await apiClient(`${ORDER_URL}/my-orders`, { signal });
  },

  async getRestaurantOrders(restaurantId, signal) {
    return await apiClient(`${ORDER_URL}/restaurant/${restaurantId}`, { signal });
  },

  async getOrderById(id, signal) {
    return await apiClient(`${ORDER_URL}/${id}`, { signal });
  },

  async updateOrderStatus(id, status, reason = '') {
    return await apiClient(`${ORDER_URL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async cancelOrder(id, reason = 'Cancelled by customer') {
    return await apiClient(`${ORDER_URL}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED', reason }),
    });
  },

  async submitReview(id, reviewPayload) {
    return await apiClient(`${ORDER_URL}/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewPayload),
    });
  },
};
