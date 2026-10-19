const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Public or owner menu retrieval
router.get('/restaurant/:restaurantId', optionalAuth, menuController.getMenu);
router.get('/item/:itemId', menuController.getMenuItemById);

// Inter-service item validation endpoint for Order Service
router.post('/validate', menuController.validateItems);

// Protected menu management (RESTAURANT_ADMIN, ADMIN)
router.post(
  '/restaurant/:restaurantId',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  menuController.addMenuItem
);

router.put(
  '/item/:itemId',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  menuController.updateMenuItem
);

router.delete(
  '/item/:itemId',
  authenticate,
  authorizeRoles('RESTAURANT_ADMIN', 'ADMIN'),
  menuController.deleteMenuItem
);

module.exports = router;
