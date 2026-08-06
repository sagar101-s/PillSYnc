const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount Routing modules
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/medications', require('./routes/medicationRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/adherence', require('./routes/adherenceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root endpoint for status check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Medication Tracking API Server is active and operational.'
  });
});

// Fallback 404 Route for unmatched paths
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - URL requested does not exist: ${req.originalUrl}`);
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
