const addressService = require('../services/address.service');

class AddressController {
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressService.getAddresses(req.user.userId);
      return res.status(200).json({
        message: 'Addresses retrieved successfully',
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  async addAddress(req, res, next) {
    try {
      const address = await addressService.addAddress(req.user.userId, req.body);
      return res.status(201).json({
        message: 'Address added successfully',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await addressService.updateAddress(id, req.user.userId, req.body);
      return res.status(200).json({
        message: 'Address updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      const result = await addressService.deleteAddress(id, req.user.userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await addressService.setDefaultAddress(id, req.user.userId);
      return res.status(200).json({
        message: 'Default address set successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
