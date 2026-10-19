const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Public endpoints
router.get('/', restaurantController.getAllRestaurants);

// Restaurant owner profile endpoint
router.get(
  '/my-restaurant',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  restaurantController.getMyRestaurant
);

// Public single restaurant view
router.get('/:id', restaurantController.getRestaurantById);

// Protected endpoints for creating/managing restaurants
router.post(
  '/',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  restaurantController.createRestaurant
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  restaurantController.updateRestaurant
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  restaurantController.toggleStatus
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  restaurantController.deleteRestaurant
);

module.exports = router;
