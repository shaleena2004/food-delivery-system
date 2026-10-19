const restaurantRepository = require('../repositories/restaurant.repository');
const menuRepository = require('../repositories/menu.repository');

const seedRestaurants = async () => {
  // Demo restaurants removed as requested.
  // System starts with an empty catalog. System Admin and Restaurant Owners add their venues.
  console.log('[restaurant-service] Ready for administrator and partner restaurant management.');
};

module.exports = { seedRestaurants };
