const orderRepository = require('../repositories/order.repository');
const { validateItemsWithRestaurant, getRestaurantDetails } = require('../utils/restaurantClient');
const { notifyDeliveryServiceReady } = require('../utils/deliveryClient');

const STATUS_PROGRESSION = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'ON_THE_WAY',
  'DELIVERED',
];

class OrderService {
  async createOrder(
    { restaurantId, items, deliveryAddress, orderNotes, paymentMethod, paymentDetails },
    user
  ) {
    if (!restaurantId) {
      const error = new Error('Restaurant ID is required');
      error.statusCode = 400;
      throw error;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Order must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    if (!deliveryAddress || !deliveryAddress.addressLines || !deliveryAddress.city) {
      const error = new Error('A valid delivery address is required');
      error.statusCode = 400;
      throw error;
    }

    // 1. Authoritative validation of prices and availability from Restaurant Service
    const validatedData = await validateItemsWithRestaurant(restaurantId, items);

    // 2. Fetch restaurant details for order snapshot
    const restaurant = await getRestaurantDetails(restaurantId);

    const subtotal = validatedData.subtotal;
    const deliveryFee = 3.99;
    const totalAmount = Number((subtotal + deliveryFee).toFixed(2));

    const method = paymentMethod || 'CREDIT_CARD';
    const isCod = method === 'CASH_ON_DELIVERY';

    const orderData = {
      customerId: user.userId,
      customerName: user.name || 'Valued Customer',
      restaurantId,
      restaurantName: restaurant ? restaurant.name : 'BiteFlow Partner Restaurant',
      items: validatedData.items,
      deliveryAddress,
      subtotal,
      deliveryFee,
      totalAmount,
      status: 'PENDING',
      paymentMethod: method,
      paymentStatus: isCod ? 'PENDING' : 'PAID',
      paymentDetails: paymentDetails || {},
      orderNotes: orderNotes || '',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: `Order placed via ${method.replace(/_/g, ' ')} (${isCod ? 'Pay on Delivery' : 'Paid'})`,
        },
      ],
    };

    const newOrder = await orderRepository.create(orderData);
    return newOrder;
  }

  async getOrderById(id, user) {
    const order = await orderRepository.findById(id);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Access control: Customer who placed it, restaurant owner, delivery person, or admin
    if (
      user.role === 'CUSTOMER' &&
      order.customerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      const error = new Error('Access denied: you do not have permission to view this order');
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  async getMyOrders(customerId) {
    return await orderRepository.findByCustomerId(customerId);
  }

  async getRestaurantOrders(restaurantId) {
    return await orderRepository.findByRestaurantId(restaurantId);
  }

  async updateOrderStatus(orderId, newStatus, reason, user) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Cancellation handling
    if (newStatus === 'CANCELLED') {
      if (user.role === 'CUSTOMER') {
        if (order.status !== 'PENDING') {
          const error = new Error('Customers can only cancel orders while in PENDING status');
          error.statusCode = 400;
          throw error;
        }
      }

      const updated = await orderRepository.updateById(orderId, {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by user',
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            timestamp: new Date(),
            note: reason || `Cancelled by ${user.role}`,
          },
        },
      });
      return updated;
    }

    // Lifecycle forward check
    const currentIndex = STATUS_PROGRESSION.indexOf(order.status);
    const nextIndex = STATUS_PROGRESSION.indexOf(newStatus);

    if (nextIndex === -1) {
      const error = new Error(`Invalid status: ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      const error = new Error(`Cannot change status of an order that is already ${order.status}`);
      error.statusCode = 400;
      throw error;
    }

    if (nextIndex <= currentIndex) {
      const error = new Error(
        `Order status can only move forward. Current: ${order.status}, Requested: ${newStatus}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Update order
    const updated = await orderRepository.updateById(orderId, {
      status: newStatus,
      $push: {
        statusHistory: {
          status: newStatus,
          timestamp: new Date(),
          note: `Status updated to ${newStatus} by ${user.role}`,
        },
      },
    });

    // If status reached READY_FOR_PICKUP, trigger delivery service!
    if (newStatus === 'READY_FOR_PICKUP') {
      const restaurant = await getRestaurantDetails(order.restaurantId);
      const deliveryPayload = {
        orderId: order._id ? order._id.toString() : order.id,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName || (restaurant ? restaurant.name : 'Restaurant'),
        customerId: order.customerId,
        pickupAddress: restaurant ? restaurant.address : 'Restaurant Kitchen',
        deliveryAddress: order.deliveryAddress,
        itemsCount: order.items ? order.items.length : 1,
      };

      // Notify Delivery Service asynchronously
      notifyDeliveryServiceReady(deliveryPayload).then((delivery) => {
        if (delivery) {
          const deliveryId = delivery._id || delivery.id;
          orderRepository.updateById(orderId, { deliveryId });
        }
      });
    }

    return updated;
  }

  // Inter-service call from Delivery Service
  async syncDeliveryStatus(orderId, deliveryStatus, note) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Map delivery status to order status if applicable
    let targetOrderStatus = order.status;
    if (deliveryStatus === 'PICKED_UP') targetOrderStatus = 'PICKED_UP';
    if (deliveryStatus === 'ON_THE_WAY') targetOrderStatus = 'ON_THE_WAY';
    if (deliveryStatus === 'DELIVERED') targetOrderStatus = 'DELIVERED';
    if (deliveryStatus === 'FAILED') targetOrderStatus = 'CANCELLED';

    const updated = await orderRepository.updateById(orderId, {
      status: targetOrderStatus,
      $push: {
        statusHistory: {
          status: targetOrderStatus,
          timestamp: new Date(),
          note: note || `Delivery updated to ${deliveryStatus}`,
        },
      },
    });

    return updated;
  }

  async addOrderReview(orderId, reviewData, user) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Access control: Only the customer who placed the order or an ADMIN can review
    if (user.role === 'CUSTOMER' && order.customerId !== user.userId && user.role !== 'ADMIN') {
      const error = new Error('Access denied: You can only review your own orders');
      error.statusCode = 403;
      throw error;
    }

    if (order.status !== 'DELIVERED') {
      const error = new Error('Reviews can only be submitted after the order has been delivered');
      error.statusCode = 400;
      throw error;
    }

    if (order.review && order.review.foodRating) {
      const error = new Error('This order has already been reviewed');
      error.statusCode = 400;
      throw error;
    }

    const foodRating = Number(reviewData.foodRating);
    const riderRating = Number(reviewData.riderRating);

    if (!foodRating || foodRating < 1 || foodRating > 5) {
      const error = new Error('Please provide a food rating between 1 and 5 stars');
      error.statusCode = 400;
      throw error;
    }

    if (!riderRating || riderRating < 1 || riderRating > 5) {
      const error = new Error('Please provide a rider rating between 1 and 5 stars');
      error.statusCode = 400;
      throw error;
    }

    const review = {
      foodRating,
      foodComment: typeof reviewData.foodComment === 'string' ? reviewData.foodComment.trim() : '',
      riderRating,
      riderComment: typeof reviewData.riderComment === 'string' ? reviewData.riderComment.trim() : '',
      imageUrl: typeof reviewData.imageUrl === 'string' ? reviewData.imageUrl.trim() : '',
      createdAt: new Date(),
    };

    const updated = await orderRepository.updateById(orderId, {
      review,
      $push: {
        statusHistory: {
          status: 'DELIVERED',
          timestamp: new Date(),
          note: `Customer submitted review (Food: ${foodRating}★, Rider: ${riderRating}★)`,
        },
      },
    });

    return updated;
  }
}

module.exports = new OrderService();
