const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const MenuItem = require('../models/menu.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'menu_items.json');

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

class MenuRepository {
  async create(data) {
    if (getIsConnected()) {
      return await MenuItem.create(data);
    }
    const list = readLocalData();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...data,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
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
      return await MenuItem.findById(id);
    }
    const list = readLocalData();
    return list.find((m) => m._id === id || m.id === id) || null;
  }

  async findByRestaurantId(restaurantId, filter = {}) {
    if (getIsConnected()) {
      return await MenuItem.find({ restaurantId, ...filter });
    }
    const list = readLocalData();
    return list.filter((m) => {
      if (m.restaurantId !== restaurantId) return false;
      for (const key of Object.keys(filter)) {
        if (m[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  async findByIds(ids = []) {
    const stringIds = ids.map(String);
    if (getIsConnected()) {
      return await MenuItem.find({ _id: { $in: stringIds } });
    }
    const list = readLocalData();
    return list.filter((m) => stringIds.includes(String(m._id)) || stringIds.includes(String(m.id)));
  }

  async updateById(id, updateData) {
    if (getIsConnected()) {
      return await MenuItem.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }
    const list = readLocalData();
    const index = list.findIndex((m) => m._id === id || m.id === id);
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
      return await MenuItem.findByIdAndDelete(id);
    }
    const list = readLocalData();
    const index = list.findIndex((m) => m._id === id || m.id === id);
    if (index === -1) return null;
    const deleted = list.splice(index, 1);
    writeLocalData(list);
    return deleted[0];
  }

  async count() {
    if (getIsConnected()) {
      return await MenuItem.countDocuments();
    }
    const list = readLocalData();
    return list.length;
  }
}

module.exports = new MenuRepository();
