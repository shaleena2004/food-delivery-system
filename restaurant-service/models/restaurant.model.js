const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    cuisineType: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
    },
    openingTime: {
      type: String,
      default: '09:00 AM',
    },
    closingTime: {
      type: String,
      default: '10:00 PM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'ACTIVE', 'INACTIVE'],
      default: 'OPEN',
    },
    ownerId: {
      type: String,
      required: [true, 'Owner ID is required'],
      index: true,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    ratingsList: [
      {
        userId: { type: String, default: 'anonymous' },
        userName: { type: String, default: 'Customer' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    deliveryTimeEstimate: {
      type: String,
      default: '25-35 min',
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
