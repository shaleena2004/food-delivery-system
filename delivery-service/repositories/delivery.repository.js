const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Delivery = require('../models/delivery.model');
const { getIsConnected } = require('../config/db');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'deliveries.json');

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

class DeliveryRepository {
  async create(data) {
    if (getIsConnected()) {
      return await Delivery.create(data);
    }
    const list = readLocalData();
    const newDoc = {
      _id: crypto.randomBytes(12).toString('hex'),
      id: crypto.randomBytes(12).toString('hex'),
      ...data,
      status: data.status || 'PENDING',
      assignedTime: null,
      pickupTime: null,
      deliveredTime: null,
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
      return await Delivery.findById(id);
    }
    const list = readLocalData();
    return list.find((d) => d._id === id || d.id === id) || null;
  }

  async findByOrderId(orderId) {
    if (!orderId) return null;
    if (getIsConnected()) {
      return await Delivery.findOne({ orderId });
    }
    const list = readLocalData();
    return list.find((d) => d.orderId === orderId) || null;
  }

  async findAvailable() {
    if (getIsConnected()) {
      return await Delivery.find({
        status: { $in: ['PENDING', 'READY_FOR_PICKUP'] },
        deliveryPersonId: null,
      }).sort({ createdAt: -1 });
    }
    const list = readLocalData();
    return list
      .filter((d) => (!d.deliveryPersonId || d.deliveryPersonId === null) && ['PENDING', 'READY_FOR_PICKUP'].includes(d.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async findByDeliveryPersonId(deliveryPersonId) {
    if (!deliveryPersonId) return [];
    if (getIsConnected()) {
      return await Delivery.find({ deliveryPersonId }).sort({ createdAt: -1 });
    }
    const list = readLocalData();
    return list
      .filter((d) => d.deliveryPersonId === deliveryPersonId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateById(id, updateData) {
    if (getIsConnected()) {
      return await Delivery.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }
    const list = readLocalData();
    const index = list.findIndex((d) => d._id === id || d.id === id);
    if (index === -1) return null;

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
      return await Delivery.countDocuments();
    }
    const list = readLocalData();
    return list.length;
  }
}

module.exports = new DeliveryRepository();
