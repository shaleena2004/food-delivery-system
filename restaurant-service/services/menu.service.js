const menuRepository = require('../repositories/menu.repository');
const restaurantRepository = require('../repositories/restaurant.repository');

class MenuService {
  async getMenuForRestaurant(restaurantId, isOwner = false) {
    const restaurant = await restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      throw error;
    }

    const filter = isOwner ? {} : { isAvailable: true };
    const items = await menuRepository.findByRestaurantId(restaurantId, filter);
    return items;
  }

  async getMenuItemById(id) {
    const item = await menuRepository.findById(id);
    if (!item) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async addMenuItem(restaurantId, itemData, user) {
    const restaurant = await restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      throw error;
    }

    if (restaurant.ownerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you do not own this restaurant');
      error.statusCode = 403;
      throw error;
    }

    if (!itemData.name || itemData.price === undefined || !itemData.category) {
      const error = new Error('Item name, price, and category are required');
      error.statusCode = 400;
      throw error;
    }

    return await menuRepository.create({
      restaurantId,
      name: itemData.name.trim(),
      description: itemData.description || '',
      category: itemData.category.trim(),
      price: Number(itemData.price),
      isAvailable: itemData.isAvailable !== undefined ? Boolean(itemData.isAvailable) : true,
      imageUrl: itemData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    });
  }

  async updateMenuItem(itemId, updateData, user) {
    const item = await this.getMenuItemById(itemId);
    const restaurant = await restaurantRepository.findById(item.restaurantId);

    if (restaurant && restaurant.ownerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you do not own this restaurant');
      error.statusCode = 403;
      throw error;
    }

    const sanitized = { ...updateData };
    if (sanitized.price !== undefined) {
      sanitized.price = Number(sanitized.price);
    }
    if (sanitized.isAvailable !== undefined) {
      sanitized.isAvailable = Boolean(sanitized.isAvailable);
    }

    return await menuRepository.updateById(itemId, sanitized);
  }

  async deleteMenuItem(itemId, user) {
    const item = await this.getMenuItemById(itemId);
    const restaurant = await restaurantRepository.findById(item.restaurantId);

    if (restaurant && restaurant.ownerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: you do not own this restaurant');
      error.statusCode = 403;
      throw error;
    }

    return await menuRepository.deleteById(itemId);
  }

  // Inter-service call: Authoritative price validation for Order Service
  async validateOrderItems(restaurantId, items = []) {
    if (!items || items.length === 0) {
      const error = new Error('Order must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    const itemIds = items.map((i) => i.menuItemId || i.id);
    const foundItems = await menuRepository.findByIds(itemIds);

    const validatedItems = [];
    let subtotal = 0;

    for (const orderItem of items) {
      const targetId = orderItem.menuItemId || orderItem.id;
      const found = foundItems.find((m) => String(m._id) === String(targetId) || String(m.id) === String(targetId));

      if (!found) {
        const error = new Error(`Item ${targetId} not found in restaurant menu`);
        error.statusCode = 404;
        throw error;
      }

      if (found.restaurantId !== restaurantId) {
        const error = new Error(`Item '${found.name}' does not belong to this restaurant`);
        error.statusCode = 400;
        throw error;
      }

      if (!found.isAvailable) {
        const error = new Error(`Item '${found.name}' is currently unavailable`);
        error.statusCode = 400;
        throw error;
      }

      const quantity = Math.max(1, parseInt(orderItem.quantity, 10) || 1);
      const unitPrice = Number(found.price);
      const lineTotal = Number((unitPrice * quantity).toFixed(2));

      subtotal += lineTotal;

      validatedItems.push({
        menuItemId: found._id || found.id,
        itemName: found.name,
        quantity,
        unitPrice,
        totalPrice: lineTotal,
        imageUrl: found.imageUrl,
      });
    }

    return {
      restaurantId,
      subtotal: Number(subtotal.toFixed(2)),
      items: validatedItems,
    };
  }
}

module.exports = new MenuService();
