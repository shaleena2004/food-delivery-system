const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Customer placing orders and viewing their own orders
router.post('/', authenticate, authorizeRoles('CUSTOMER', 'ADMIN'), orderController.createOrder);
router.get('/my-orders', authenticate, authorizeRoles('CUSTOMER', 'ADMIN'), orderController.getMyOrders);

// Restaurant orders
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  orderController.getRestaurantOrders
);

// Inter-service sync endpoint for Delivery Service
router.patch('/:id/delivery-status', orderController.syncDeliveryStatus);

// View and update order
router.get('/:id', authenticate, orderController.getOrderById);
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

// Submit review for delivered order
router.post('/:id/review', authenticate, authorizeRoles('CUSTOMER', 'ADMIN'), orderController.addOrderReview);

module.exports = router;
