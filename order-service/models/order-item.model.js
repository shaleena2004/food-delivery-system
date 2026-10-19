const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      index: true,
    },
    menuItemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = { OrderItem, orderItemSchema };
