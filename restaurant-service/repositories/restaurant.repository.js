const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Restaurant = require('../models/restaurant.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'restaurants.json');

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

class RestaurantRepository {
  async create(data) {
    if (getIsConnected()) {
      return await Restaurant.create(data);
    }
    const list = readLocalData();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...data,
      status: data.status || 'OPEN',
      rating: data.rating || 4.8,
      deliveryTimeEstimate: data.deliveryTimeEstimate || '25-35 min',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newDoc.id = newDoc._id;
    list.push(newDoc);
    writeLocalData(list);
    return newDoc;
  }

  async findById(id) {
    if (!id) return null;
    if (getIsConnected()) {
      return await Restaurant.findById(id);
    }
    const list = readLocalData();
    return list.find((r) => r._id === id || r.id === id) || null;
  }

  async findByOwnerId(ownerId) {
    if (!ownerId) return null;
    if (getIsConnected()) {
      return await Restaurant.findOne({ ownerId });
    }
    const list = readLocalData();
    return list.find((r) => r.ownerId === ownerId) || null;
  }

  async findAll(filter = {}) {
    if (getIsConnected()) {
      return await Restaurant.find(filter);
    }
    const list = readLocalData();
    return list.filter((r) => {
      for (const key of Object.keys(filter)) {
        if (filter[key] instanceof RegExp) {
          if (!filter[key].test(r[key])) return false;
        } else if (r[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async updateById(id, updateData) {
    if (getIsConnected()) {
      return await Restaurant.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }
    const list = readLocalData();
    const index = list.findIndex((r) => r._id === id || r.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(list);
    return list[index];
  }

  async deleteById(id) {
    if (getIsConnected()) {
      return await Restaurant.findByIdAndDelete(id);
    }
    const list = readLocalData();
    const index = list.findIndex((r) => r._id === id || r.id === id);
    if (index === -1) return null;
    const deleted = list.splice(index, 1);
    writeLocalData(list);
    return deleted[0];
  }

  async count() {
    if (getIsConnected()) {
      return await Restaurant.countDocuments();
    }
    const list = readLocalData();
    return list.length;
  }
}

module.exports = new RestaurantRepository();
