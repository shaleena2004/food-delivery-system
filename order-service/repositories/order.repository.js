const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Order = require('../models/order.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'orders.json');

const ensureFileExists = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf-8');
  }
};

const readLocalData = () => {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
};

const writeLocalData = (data) => {
  ensureFileExists();
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

class OrderRepository {
  async create(orderData) {
    if (getIsConnected()) {
      return await Order.create(orderData);
    }
    const orders = readLocalData();
    const newOrder = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...orderData,
      status: orderData.status || 'PENDING',
      deliveryFee: orderData.deliveryFee || 3.99,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newOrder.id = newOrder._id;
    orders.push(newOrder);
    writeLocalData(orders);
    return newOrder;
  }

  async findById(id) {
    if (!id) return null;
    if (getIsConnected()) {
      return await Order.findById(id);
    }
    const orders = readLocalData();
    return orders.find((o) => o._id === id || o.id === id) || null;
  }

  async findByCustomerId(customerId) {
    if (!customerId) return [];
    if (getIsConnected()) {
      return await Order.find({ customerId }).sort({ createdAt: -1 });
    }
    const orders = readLocalData();
    return orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async findByRestaurantId(restaurantId) {
    if (!restaurantId) return [];
    if (getIsConnected()) {
      return await Order.find({ restaurantId }).sort({ createdAt: -1 });
    }
    const orders = readLocalData();
    return orders
      .filter((o) => o.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async findAll(filter = {}) {
    if (getIsConnected()) {
      return await Order.find(filter).sort({ createdAt: -1 });
    }
    const orders = readLocalData();
    return orders
      .filter((o) => {
        for (const key of Object.keys(filter)) {
          if (o[key] !== filter[key]) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateById(id, updateData) {
    if (getIsConnected()) {
      return await Order.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }
    const orders = readLocalData();
    const index = orders.findIndex((o) => o._id === id || o.id === id);
    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    writeLocalData(orders);
    return orders[index];
  }

  async count() {
    if (getIsConnected()) {
      return await Order.countDocuments();
    }
    const orders = readLocalData();
    return orders.length;
  }
}

module.exports = new OrderRepository();
