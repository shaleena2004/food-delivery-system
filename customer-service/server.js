require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const customerRoutes = require('./routes/customer.routes');
const addressRoutes = require('./routes/address.routes');
const customerController = require('./controllers/customer.controller');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5005;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === CORS_ORIGIN ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', customerController.health);

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/customers/addresses', addressRoutes);
app.use('/api/addresses', addressRoutes); // Convenience alias

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found on customer-service` });
});

// Error handling middleware
app.use(errorHandler);

const syncCustomersFromAuth = async () => {
  try {
    const mongoose = require('mongoose');
    const authUri =
      process.env.AUTH_MONGO_URI ||
      'mongodb+srv://shaleena:Shaleena_2004@cluster0.5strdts.mongodb.net/biteflow_auth?retryWrites=true&w=majority';
    const authConn = await mongoose.createConnection(authUri).asPromise();
    const Customer = require('./models/customer.model');
    const Address = require('./models/address.model');

    const authCustomers = await authConn.collection('users').find({ role: 'CUSTOMER' }).toArray();
    for (const u of authCustomers) {
      const userId = u._id.toString();
      const existing = await Customer.findOne({ userId });
      if (!existing) {
        const parts = (u.name || '').trim().split(' ');
        const firstName = parts[0] || 'Valued';
        const lastName = parts.slice(1).join(' ') || 'Customer';

        await Customer.create({
          userId,
          firstName,
          lastName,
          phoneNumber: '+1 (555) 019-2834',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          status: 'ACTIVE',
        });

        const existingAddr = await Address.findOne({ customerId: userId });
        if (!existingAddr) {
          await Address.create({
            customerId: userId,
            addressName: 'Home',
            addressLines: '45 Park Avenue, Apt 7B',
            city: 'New York',
            postalCode: '10016',
            isDefault: true,
          });
        }
        console.log(`[customer-service] Synced profile & address for customer: ${u.name}`);
      }
    }
    await authConn.close();
  } catch (err) {
    console.warn(`[customer-service] Customer sync notice: ${err.message}`);
  }
};

const startServer = async () => {
  await connectDB();
  await syncCustomersFromAuth();
  app.listen(PORT, () => {
    console.log(`[customer-service] Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
