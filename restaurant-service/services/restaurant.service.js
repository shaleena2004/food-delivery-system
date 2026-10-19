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

    const isOwner =
      restaurant.ownerId === user.userId ||
      (user.email && restaurant.email && restaurant.email.toLowerCase() === user.email.toLowerCase());

    if (!isOwner && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you are not the owner of this restaurant');
      error.statusCode = 403;
      throw error;
    }

    return await restaurantRepository.updateById(id, {
      ...data,
      ownerId: user.userId,
    });
  }

  async toggleStatus(id, user) {
    const restaurant = await this.getRestaurantById(id);

    const isOwner =
      restaurant.ownerId === user.userId ||
      (user.email && restaurant.email && restaurant.email.toLowerCase() === user.email.toLowerCase());

    if (!isOwner && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you are not the owner of this restaurant');
      error.statusCode = 403;
      throw error;
    }

    const newStatus = restaurant.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    return await restaurantRepository.updateById(id, {
      status: newStatus,
      ownerId: user.userId,
    });
  }

  async deleteRestaurant(id, user) {
    const restaurant = await this.getRestaurantById(id);

    const isOwner =
      restaurant.ownerId === user.userId ||
      (user.email && restaurant.email && restaurant.email.toLowerCase() === user.email.toLowerCase());

    if (!isOwner && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you are not the owner of this restaurant');
      error.statusCode = 403;
      throw error;
    }

    return await restaurantRepository.deleteById(id);
  }

  async addRating(id, { rating, comment, userId, userName }) {
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      const error = new Error('Rating must be between 1 and 5 stars');
      error.statusCode = 400;
      throw error;
    }

    const restaurant = await this.getRestaurantById(id);
    const currentTotal = restaurant.totalRatings || 0;
    const currentRating = restaurant.rating || 5.0;

    const newTotal = currentTotal + 1;
    const newAverage = currentTotal === 0
      ? numRating
      : Number((((currentRating * currentTotal) + numRating) / newTotal).toFixed(1));

    const reviewEntry = {
      userId: userId || 'anonymous',
      userName: userName || 'Customer',
      rating: numRating,
      comment: (comment || '').trim(),
      createdAt: new Date(),
    };

    const updated = await restaurantRepository.updateById(id, {
      rating: newAverage,
      totalRatings: newTotal,
      $push: { ratingsList: reviewEntry },
    });

    return {
      restaurantId: id,
      rating: newAverage,
      totalRatings: newTotal,
      review: reviewEntry,
      restaurant: updated,
    };
  }

  async getRestaurantReviews(id) {
    const restaurant = await this.getRestaurantById(id);
    return {
      rating: restaurant.rating || 5.0,
      totalRatings: restaurant.totalRatings || 0,
      reviews: restaurant.ratingsList || [],
    };
  }
}

module.exports = new RestaurantService();
