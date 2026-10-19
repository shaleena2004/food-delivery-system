const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/profile', authenticate, customerController.getProfile);
router.put('/profile', authenticate, customerController.updateProfile);

module.exports = router;
