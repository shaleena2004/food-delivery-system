const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      index: true,
    },
    deliveryPersonId: {
      type: String,
      default: null,
      index: true,
    },
    deliveryPersonName: {
      type: String,
      default: null,
    },
    restaurantId: {
      type: String,
      required: true,
    },
    restaurantName: {
      type: String,
      default: '',
    },
    customerId: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      addressName: { type: String, default: 'Default' },
      addressLines: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ASSIGNED',
        'PICKUP_PENDING',
        'PICKED_UP',
        'ON_THE_WAY',
        'DELIVERED',
        'FAILED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    assignedTime: {
      type: Date,
      default: null,
    },
    pickupTime: {
      type: Date,
      default: null,
    },
    deliveredTime: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    itemsCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
