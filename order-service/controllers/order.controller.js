const orderService = require('../services/order.service');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.body, req.user);
      return res.status(201).json({
        message: 'Order placed successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getMyOrders(req.user.userId);
      return res.status(200).json({
        message: 'Order history retrieved successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantOrders(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const orders = await orderService.getRestaurantOrders(restaurantId);
      return res.status(200).json({
        message: 'Restaurant orders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id, req.user);
      return res.status(200).json({
        message: 'Order details retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const updated = await orderService.updateOrderStatus(id, status, reason, req.user);
      return res.status(200).json({
        message: 'Order status updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // Inter-service endpoint called by Delivery Service
  async syncDeliveryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const updated = await orderService.syncDeliveryStatus(id, status, note);
      return res.status(200).json({
        message: 'Order delivery status synced successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async addOrderReview(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await orderService.addOrderReview(id, req.body, req.user);
      return res.status(200).json({
        message: 'Review submitted successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async health(req, res) {
    return res.status(200).json({
      service: 'order-service',
      status: 'UP',
      port: process.env.PORT || 5003,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new OrderController();
