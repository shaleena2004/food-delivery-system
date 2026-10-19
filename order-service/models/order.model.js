const mongoose = require('mongoose');
const { orderItemSchema } = require('./order-item.model');

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      index: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    restaurantId: {
      type: String,
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    restaurantName: {
      type: String,
      default: '',
    },
    items: [orderItemSchema],
    deliveryAddress: {
      addressName: { type: String, default: 'Default' },
      addressLines: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 3.99,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'ON_THE_WAY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CREDIT_CARD', 'CASH_ON_DELIVERY', 'DIGITAL_WALLET', 'ONLINE_BANKING'],
      default: 'CREDIT_CARD',
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED'],
      default: 'PAID',
    },
    paymentDetails: {
      cardLast4: { type: String, default: '' },
      cardBrand: { type: String, default: '' },
      walletType: { type: String, default: '' },
      bankName: { type: String, default: '' },
      transactionId: { type: String, default: '' },
    },
    deliveryId: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    orderNotes: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    review: {
      foodRating: { type: Number, min: 1, max: 5 },
      foodComment: { type: String, default: '' },
      riderRating: { type: Number, min: 1, max: 5 },
      riderComment: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
