const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/user.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'users.json');

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

class UserRepository {
  async create(userData) {
    if (getIsConnected()) {
      return await User.create(userData);
    }
    const users = readLocalData();
    const newUser = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...userData,
      status: userData.status || 'ACTIVE',
      role: userData.role || 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newUser.id = newUser._id;
    users.push(newUser);
    writeLocalData(users);
    return newUser;
  }

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    if (getIsConnected()) {
      return await User.findOne({ email: cleanEmail });
    }
    const users = readLocalData();
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  async findById(id) {
    if (!id) return null;
    if (getIsConnected()) {
      return await User.findById(id);
    }
    const users = readLocalData();
    return users.find((u) => u._id === id || u.id === id) || null;
  }

  async findAll(filter = {}) {
    if (getIsConnected()) {
      return await User.find(filter).select('-password');
    }
    const users = readLocalData();
    return users
      .filter((u) => {
        for (const key of Object.keys(filter)) {
          if (u[key] !== filter[key]) return false;
        }
        return true;
      })
      .map(({ password, ...rest }) => rest);
  }

  async updateById(id, updateData) {
    if (getIsConnected()) {
      return await User.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');
    }
    const users = readLocalData();
    const index = users.findIndex((u) => u._id === id || u.id === id);
    if (index === -1) return null;
    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(users);
    const { password, ...rest } = users[index];
    return rest;
  }

  async count() {
    if (getIsConnected()) {
      return await User.countDocuments();
    }
    const users = readLocalData();
    return users.length;
  }
}

module.exports = new UserRepository();
