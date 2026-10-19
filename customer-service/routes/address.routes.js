const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, addressController.getAddresses);
router.post('/', authenticate, addressController.addAddress);
router.put('/:id', authenticate, addressController.updateAddress);
router.delete('/:id', authenticate, addressController.deleteAddress);
router.patch('/:id/default', authenticate, addressController.setDefaultAddress);

module.exports = router;
