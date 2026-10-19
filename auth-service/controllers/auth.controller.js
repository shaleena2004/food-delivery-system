const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.userId);
      return res.status(200).json({
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      return res.status(200).json({
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await authService.updateUserStatus(id, status);
      return res.status(200).json({
        message: 'User status updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUserByAdmin(req, res, next) {
    try {
      const created = await authService.createUserByAdmin(req.body);
      return res.status(201).json({
        message: `Account for ${created.name} (${created.role}) created successfully`,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async health(req, res) {
    return res.status(200).json({
      service: 'auth-service',
      status: 'UP',
      port: process.env.PORT || 5001,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new AuthController();
