// AnalyticsService/models/processedEvent.model.js
const mongoose = require('mongoose');

const processedEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true }, // e.g., `${event.bookingId}_${event.eventType}`
  processedAt: { type: Date, default: Date.now, expires: '7d' } // 7 din baad auto-expire
});

module.exports = mongoose.model('ProcessedEvent', processedEventSchema);
