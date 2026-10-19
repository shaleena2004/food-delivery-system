const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI ||
    'mongodb+srv://shaleena:Shaleena_2004@cluster0.5strdts.mongodb.net/biteflow_auth?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`[auth-service] MongoDB Connected to database '${conn.connection.name}' on ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[auth-service] MongoDB connection failed (${error.message}). Falling back to local file-based repository.`);
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
