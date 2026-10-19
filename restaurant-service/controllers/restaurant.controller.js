const restaurantService = require('../services/restaurant.service');

class RestaurantController {
  async getAllRestaurants(req, res, next) {
    try {
      const { search, cuisine, status } = req.query;
      const restaurants = await restaurantService.getAllRestaurants({ search, cuisine, status });
      return res.status(200).json({
        message: 'Restaurants retrieved successfully',
        data: restaurants,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantById(req, res, next) {
    try {
      const { id } = req.params;
      const restaurant = await restaurantService.getRestaurantById(id);
      return res.status(200).json({
        message: 'Restaurant retrieved successfully',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRestaurant(req, res, next) {
    try {
      const restaurant = await restaurantService.getRestaurantByOwnerId(req.user.userId, req.user.email);
      return res.status(200).json({
        message: 'Owner restaurant retrieved successfully',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRestaurant(req, res, next) {
    try {
      const restaurant = await restaurantService.createRestaurant(req.body, req.user);
      return res.status(201).json({
        message: 'Restaurant created successfully',
        data: restaurant,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurant(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await restaurantService.updateRestaurant(id, req.body, req.user);
      return res.status(200).json({
        message: 'Restaurant updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await restaurantService.toggleStatus(id, req.user);
      return res.status(200).json({
        message: 'Restaurant status toggled successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRestaurant(req, res, next) {
    try {
      const { id } = req.params;
      await restaurantService.deleteRestaurant(id, req.user);
      return res.status(200).json({
        message: 'Restaurant deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addRating(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const result = await restaurantService.addRating(id, {
        rating,
        comment,
        userId: req.user ? req.user.userId : 'anonymous',
        userName: req.user ? (req.user.name || req.user.email) : 'Verified Customer',
      });
      return res.status(200).json({
        message: 'Rating and review submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantReviews(req, res, next) {
    try {
      const { id } = req.params;
      const reviews = await restaurantService.getRestaurantReviews(id);
      return res.status(200).json({
        message: 'Reviews retrieved successfully',
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async health(req, res) {
    return res.status(200).json({
      service: 'restaurant-service',
      status: 'UP',
      port: process.env.PORT || 5002,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new RestaurantController();
