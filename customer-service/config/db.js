const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    'mongodb+srv://shaleena:Shaleena_2004@cluster0.5strdts.mongodb.net/biteflow_customer?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnected = true;
    console.log(`[customer-service] MongoDB Connected to database '${conn.connection.name}' on ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[customer-service] MongoDB initial connection warning (${error.message}). Retrying in background...`);
    isConnected = false;
    setTimeout(connectDB, 3000);
    return false;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

const getIsConnected = () => isConnected || (mongoose.connection && mongoose.connection.readyState === 1);

module.exports = { connectDB, getIsConnected };
