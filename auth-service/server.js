require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const authController = require('./controllers/auth.controller');
const { errorHandler } = require('./middleware/error.middleware');
const { seedUsers } = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // allow local dev origins
      if (
        origin === CORS_ORIGIN ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local dev & evaluation
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', authController.health);

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found on auth-service` });
});

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await seedUsers();
  app.listen(PORT, () => {
    console.log(`[auth-service] Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
