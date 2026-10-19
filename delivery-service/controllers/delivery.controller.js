const deliveryService = require('../services/delivery.service');

class DeliveryController {
  async createDelivery(req, res, next) {
    try {
      const delivery = await deliveryService.createDelivery(req.body);
      return res.status(201).json({
        message: 'Delivery record created successfully',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableDeliveries(req, res, next) {
    try {
      const deliveries = await deliveryService.getAvailableDeliveries();
      return res.status(200).json({
        message: 'Available deliveries retrieved successfully',
        data: deliveries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyDeliveries(req, res, next) {
    try {
      const deliveries = await deliveryService.getMyDeliveries(req.user.userId);
      return res.status(200).json({
        message: 'Rider deliveries retrieved successfully',
        data: deliveries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveryById(req, res, next) {
    try {
      const { id } = req.params;
      const delivery = await deliveryService.getDeliveryById(id);
      return res.status(200).json({
        message: 'Delivery details retrieved successfully',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveryByOrderId(req, res, next) {
    try {
      const { orderId } = req.params;
      const delivery = await deliveryService.getDeliveryByOrderId(orderId);
      return res.status(200).json({
        message: 'Order delivery details retrieved successfully',
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptDelivery(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await deliveryService.acceptDelivery(id, req.user);
      return res.status(200).json({
        message: 'Delivery accepted successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDeliveryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const updated = await deliveryService.updateDeliveryStatus(id, status, req.user, notes);
      return res.status(200).json({
        message: 'Delivery status updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async health(req, res) {
    return res.status(200).json({
      service: 'delivery-service',
      status: 'UP',
      port: process.env.PORT || 5004,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new DeliveryController();
