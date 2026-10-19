const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Address = require('../models/address.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'addresses.json');

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

class AddressRepository {
  async create(data) {
    if (getIsConnected()) {
      return await Address.create(data);
    }
    const list = readLocalData();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...data,
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
      return await Address.findById(id);
    }
    const list = readLocalData();
    return list.find((a) => a._id === id || a.id === id) || null;
  }

  async findByCustomerId(customerId) {
    if (!customerId) return [];
    if (getIsConnected()) {
      return await Address.find({ customerId }).sort({ isDefault: -1, createdAt: -1 });
    }
    const list = readLocalData();
    return list
      .filter((a) => a.customerId === customerId)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }

  async clearDefaultFlag(customerId) {
    if (getIsConnected()) {
      return await Address.updateMany({ customerId }, { isDefault: false });
    }
    const list = readLocalData();
    for (const a of list) {
      if (a.customerId === customerId) {
        a.isDefault = false;
      }
    }
    writeLocalData(list);
  }

  async updateById(id, updateData) {
    if (getIsConnected()) {
      return await Address.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }
    const list = readLocalData();
    const index = list.findIndex((a) => a._id === id || a.id === id);
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
      return await Address.findByIdAndDelete(id);
    }
    const list = readLocalData();
    const index = list.findIndex((a) => a._id === id || a.id === id);
    if (index === -1) return null;

    const deleted = list.splice(index, 1);
    writeLocalData(list);
    return deleted[0];
  }

  async countByCustomerId(customerId) {
    if (getIsConnected()) {
      return await Address.countDocuments({ customerId });
    }
    const list = readLocalData();
    return list.filter((a) => a.customerId === customerId).length;
  }
}

module.exports = new AddressRepository();
