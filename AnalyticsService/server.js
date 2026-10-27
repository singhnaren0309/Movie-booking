require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { runAnalyticsConsumer } = require('./workers/analytics.consumer');
const analyticsController = require('./controllers/analytics.controller');

const app = express();
app.use(express.json());

// Routes
app.get('/api/v1/analytics/top-movies', analyticsController.getTopMovies);
app.get('/api/v1/analytics/summary', analyticsController.getPlatformSummary);

const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/analytics_db')
  .then(async () => {
    console.log('[ANALYTICS] MongoDB Connected');
    // Start Kafka consumer in background
    runAnalyticsConsumer().catch(err => console.error('[ANALYTICS] Consumer start error:', err));
    
    app.listen(PORT, () => console.log(`[ANALYTICS] Service running on port ${PORT}`));
  })
  .catch(err => console.error('[ANALYTICS] Mongo connection error:', err));
