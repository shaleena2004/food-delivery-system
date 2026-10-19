const deliveryRepository = require('../repositories/delivery.repository');
const { syncOrderStatus } = require('../utils/orderClient');

class DeliveryService {
  async createDelivery(data) {
    if (!data.orderId || !data.restaurantId || !data.pickupAddress || !data.deliveryAddress) {
      const error = new Error('orderId, restaurantId, pickupAddress, and deliveryAddress are required');
      error.statusCode = 400;
      throw error;
    }

    // Prevent duplicate deliveries for the same order
    const existing = await deliveryRepository.findByOrderId(data.orderId);
    if (existing) {
      return existing;
    }

    const delivery = await deliveryRepository.create({
      orderId: data.orderId,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName || '',
      customerId: data.customerId,
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      status: 'PENDING',
      itemsCount: data.itemsCount || 1,
    });

    return delivery;
  }

  async getAvailableDeliveries() {
    return await deliveryRepository.findAvailable();
  }

  async getMyDeliveries(deliveryPersonId) {
    return await deliveryRepository.findByDeliveryPersonId(deliveryPersonId);
  }

  async getDeliveryById(id) {
    const delivery = await deliveryRepository.findById(id);
    if (!delivery) {
      const error = new Error('Delivery not found');
      error.statusCode = 404;
      throw error;
    }
    return delivery;
  }

  async getDeliveryByOrderId(orderId) {
    const delivery = await deliveryRepository.findByOrderId(orderId);
    return delivery;
  }

  async acceptDelivery(deliveryId, deliveryPerson) {
    const delivery = await this.getDeliveryById(deliveryId);

    // Prevent duplicate assignments
    if (delivery.deliveryPersonId) {
      const error = new Error('This delivery has already been accepted by another rider');
      error.statusCode = 409;
      throw error;
    }

    if (delivery.status === 'CANCELLED' || delivery.status === 'DELIVERED') {
      const error = new Error(`Cannot accept an order with status ${delivery.status}`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await deliveryRepository.updateById(deliveryId, {
      deliveryPersonId: deliveryPerson.userId,
      deliveryPersonName: deliveryPerson.name || 'Delivery Partner',
      status: 'ASSIGNED',
      assignedTime: new Date(),
    });

    return updated;
  }

  async updateDeliveryStatus(deliveryId, newStatus, deliveryPerson, notes) {
    const delivery = await this.getDeliveryById(deliveryId);

    // Rule: only the assigned delivery person may update its status
    if (
      delivery.deliveryPersonId !== deliveryPerson.userId &&
      deliveryPerson.role !== 'ADMIN'
    ) {
      const error = new Error('Access denied: only the assigned delivery rider can update this delivery status');
      error.statusCode = 403;
      throw error;
    }

    const validStatuses = [
      'ASSIGNED',
      'PICKUP_PENDING',
      'PICKED_UP',
      'ON_THE_WAY',
      'DELIVERED',
      'FAILED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(newStatus)) {
      const error = new Error(`Invalid delivery status: ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    const updatePayload = {
      status: newStatus,
      notes: notes || delivery.notes,
    };

    if (newStatus === 'PICKED_UP' && !delivery.pickupTime) {
      updatePayload.pickupTime = new Date();
    }

    if (newStatus === 'DELIVERED' && !delivery.deliveredTime) {
      updatePayload.deliveredTime = new Date();
    }

    const updated = await deliveryRepository.updateById(deliveryId, updatePayload);

    // Synchronize delivery progress with Order Service
    if (['PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'FAILED'].includes(newStatus)) {
      await syncOrderStatus(delivery.orderId, newStatus, notes);
    }

    return updated;
  }
}

module.exports = new DeliveryService();
