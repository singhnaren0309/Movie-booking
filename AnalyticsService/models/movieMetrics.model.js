const mongoose = require('mongoose');

const movieMetricsSchema = new mongoose.Schema({
  movieId: { type: String, required: false },
  movieName: { type: String, required: true, unique: true, index: true },
  totalBookings: { type: Number, default: 0 },
  totalTicketsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCancellations: { type: Number, default: 0 },
  refundedAmount: { type: Number, default: 0 },
  theatreWiseStats: [{
    theatreName: String,
    seatsSold: Number,
    revenue: Number
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MovieMetrics', movieMetricsSchema);
