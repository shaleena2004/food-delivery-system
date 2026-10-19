const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Endpoint for Order Service / Admin to create a delivery record
router.post('/', deliveryController.createDelivery);

// Delivery person specific views
router.get(
  '/available',
  authenticate,
  authorizeRoles('DELIVERY_PERSON', 'ADMIN'),
  deliveryController.getAvailableDeliveries
);

router.get(
  '/my-deliveries',
  authenticate,
  authorizeRoles('DELIVERY_PERSON', 'ADMIN'),
  deliveryController.getMyDeliveries
);

// Delivery status and detail retrieval
router.get('/order/:orderId', authenticate, deliveryController.getDeliveryByOrderId);
router.get('/:id', authenticate, deliveryController.getDeliveryById);

// Accept delivery and status updates
router.patch(
  '/:id/accept',
  authenticate,
  authorizeRoles('DELIVERY_PERSON', 'ADMIN'),
  deliveryController.acceptDelivery
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('DELIVERY_PERSON', 'ADMIN'),
  deliveryController.updateDeliveryStatus
);

module.exports = router;
