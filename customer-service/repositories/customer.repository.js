const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Customer = require('../models/customer.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'customers.json');

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

class CustomerRepository {
  async create(data) {
    if (getIsConnected()) {
      return await Customer.create(data);
    }
    const list = readLocalData();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...data,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newDoc.id = newDoc._id;
    list.push(newDoc);
    writeLocalData(list);
    return newDoc;
  }

  async findByUserId(userId) {
    if (!userId) return null;
    if (getIsConnected()) {
      return await Customer.findOne({ userId });
    }
    const list = readLocalData();
    return list.find((c) => c.userId === userId) || null;
  }

  async findById(id) {
    if (!id) return null;
    if (getIsConnected()) {
      return await Customer.findById(id);
    }
    const list = readLocalData();
    return list.find((c) => c._id === id || c.id === id) || null;
  }

  async updateByUserId(userId, updateData) {
    if (getIsConnected()) {
      return await Customer.findOneAndUpdate(
        { userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, upsert: true, runValidators: true }
      );
    }
    const list = readLocalData();
    const index = list.findIndex((c) => c.userId === userId);
    if (index === -1) {
      return await this.create({ userId, ...updateData });
    }
    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(list);
    return list[index];
  }

  async count() {
    if (getIsConnected()) {
      return await Customer.countDocuments();
    }
    const list = readLocalData();
    return list.length;
  }
}

module.exports = new CustomerRepository();
