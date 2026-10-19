const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getProfile);

// Admin-only routes
router.get('/users', authenticate, authorizeRoles('ADMIN'), authController.getAllUsers);
router.post('/users', authenticate, authorizeRoles('ADMIN'), authController.createUserByAdmin);
router.patch('/users/:id/status', authenticate, authorizeRoles('ADMIN'), authController.updateUserStatus);

module.exports = router;
