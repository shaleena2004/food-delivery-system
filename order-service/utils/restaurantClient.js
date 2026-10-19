const RESTAURANT_SERVICE_URL =
  process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002';

const validateItemsWithRestaurant = async (restaurantId, items) => {
  try {
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/menu/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        restaurantId,
        items,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Failed to validate menu items with Restaurant Service');
      error.statusCode = response.status;
      throw error;
    }

    return data.data;
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error(`Cannot reach Restaurant Service at ${RESTAURANT_SERVICE_URL}: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }
};

const getRestaurantDetails = async (restaurantId) => {
  try {
    const response = await fetch(`${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`);
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
};

module.exports = { validateItemsWithRestaurant, getRestaurantDetails };
