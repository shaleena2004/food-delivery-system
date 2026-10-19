const customerService = require('../services/customer.service');

class CustomerController {
  async getProfile(req, res, next) {
    try {
      const customer = await customerService.getProfile(req.user.userId, req.user);
      return res.status(200).json({
        message: 'Customer profile retrieved successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await customerService.updateProfile(req.user.userId, req.body);
      return res.status(200).json({
        message: 'Customer profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async health(req, res) {
    return res.status(200).json({
      service: 'customer-service',
      status: 'UP',
      port: process.env.PORT || 5005,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new CustomerController();
