require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const restaurantRoutes = require('./routes/restaurant.routes');
const menuRoutes = require('./routes/menu.routes');
const restaurantController = require('./controllers/restaurant.controller');
const { errorHandler } = require('./middleware/error.middleware');
const { seedRestaurants } = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 5002;
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
app.get('/health', restaurantController.health);

// API routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);

// Compatibility route: /api/restaurants/:restaurantId/menu
app.use('/api/restaurants/:restaurantId/menu', (req, res, next) => {
  req.url = `/restaurant/${req.params.restaurantId}${req.url === '/' ? '' : req.url}`;
  menuRoutes(req, res, next);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found on restaurant-service` });
});

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await seedRestaurants();
  app.listen(PORT, () => {
    console.log(`[restaurant-service] Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
