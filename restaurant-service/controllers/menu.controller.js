const menuService = require('../services/menu.service');
const restaurantRepository = require('../repositories/restaurant.repository');

class MenuController {
  async getMenu(req, res, next) {
    try {
      const { restaurantId } = req.params;

      // Check if logged-in user is the restaurant owner
      let isOwner = false;
      if (req.user) {
        if (req.user.role === 'ADMIN') {
          isOwner = true;
        } else {
          const restaurant = await restaurantRepository.findById(restaurantId);
          if (restaurant && restaurant.ownerId === req.user.userId) {
            isOwner = true;
          }
        }
      }

      const menu = await menuService.getMenuForRestaurant(restaurantId, isOwner);
      return res.status(200).json({
        message: 'Menu retrieved successfully',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMenuItemById(req, res, next) {
    try {
      const { itemId } = req.params;
      const item = await menuService.getMenuItemById(itemId);
      return res.status(200).json({
        message: 'Menu item retrieved successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async addMenuItem(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const item = await menuService.addMenuItem(restaurantId, req.body, req.user);
      return res.status(201).json({
        message: 'Menu item created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMenuItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const updated = await menuService.updateMenuItem(itemId, req.body, req.user);
      return res.status(200).json({
        message: 'Menu item updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMenuItem(req, res, next) {
    try {
      const { itemId } = req.params;
      await menuService.deleteMenuItem(itemId, req.user);
      return res.status(200).json({
        message: 'Menu item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Inter-service endpoint for Order Service
  async validateItems(req, res, next) {
    try {
      const { restaurantId, items } = req.body;
      if (!restaurantId || !Array.isArray(items)) {
        return res.status(400).json({ message: 'restaurantId and items array are required' });
      }

      const result = await menuService.validateOrderItems(restaurantId, items);
      return res.status(200).json({
        message: 'Items validated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
