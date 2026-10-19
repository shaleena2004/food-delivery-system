const restaurantRepository = require('../repositories/restaurant.repository');

class RestaurantService {
  async getAllRestaurants({ search, cuisine, status } = {}) {
    const filter = {};
    if (status) {
      filter.status = status;
    }

    let restaurants = await restaurantRepository.findAll(filter);

    if (search) {
      const term = search.toLowerCase();
      restaurants = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.cuisineType.toLowerCase().includes(term) ||
          (r.description && r.description.toLowerCase().includes(term))
      );
    }

    if (cuisine && cuisine !== 'All') {
      restaurants = restaurants.filter(
        (r) => r.cuisineType.toLowerCase() === cuisine.toLowerCase()
      );
    }

    return restaurants;
  }

  async getRestaurantById(id) {
    const restaurant = await restaurantRepository.findById(id);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      throw error;
    }
    return restaurant;
  }

  async getRestaurantByOwnerId(ownerId, userEmail = '') {
    let restaurant = await restaurantRepository.findByOwnerId(ownerId);
    if (!restaurant && userEmail) {
      const all = await restaurantRepository.findAll();
      const match = all.find((r) => r.email === userEmail);
      if (match) {
        restaurant = await restaurantRepository.updateById(match._id || match.id, { ownerId });
      }
    }
    return restaurant;
  }

  async createRestaurant(data, user) {
    if (!data.name || !data.address || !data.contactNumber || !data.cuisineType) {
      const error = new Error('Name, address, contact number, and cuisine type are required');
      error.statusCode = 400;
      throw error;
    }

    // A restaurant admin can only have one primary restaurant
    const existing = await restaurantRepository.findByOwnerId(user.userId);
    if (existing && user.role !== 'ADMIN') {
      const error = new Error('You already have a registered restaurant. You can manage or update it.');
      error.statusCode = 409;
      throw error;
    }

    const restaurantData = {
      ...data,
      ownerId: data.ownerId || user.userId,
      email: data.email || user.email,
    };

    return await restaurantRepository.create(restaurantData);
  }

  async updateRestaurant(id, data, user) {
    const restaurant = await this.getRestaurantById(id);

    // Permission check: only owner or ADMIN
    if (restaurant.ownerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you are not the owner of this restaurant');
      error.statusCode = 403;
      throw error;
    }

    return await restaurantRepository.updateById(id, data);
  }

  async toggleStatus(id, user) {
    const restaurant = await this.getRestaurantById(id);

    if (restaurant.ownerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you are not the owner of this restaurant');
      error.statusCode = 403;
      throw error;
    }

    const newStatus = restaurant.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    return await restaurantRepository.updateById(id, { status: newStatus });
  }

  async deleteRestaurant(id, user) {
    const restaurant = await this.getRestaurantById(id);

    if (restaurant.ownerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you are not the owner of this restaurant');
      error.statusCode = 403;
      throw error;
    }

    return await restaurantRepository.deleteById(id);
  }
}

module.exports = new RestaurantService();
