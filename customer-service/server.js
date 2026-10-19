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

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[customer-service] Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
