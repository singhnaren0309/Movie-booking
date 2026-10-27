const MovieMetrics = require('../models/movieMetrics.model');

// Top grossing movies fetch karna
exports.getTopMovies = async (req, res) => {
  try {
    const topMovies = await MovieMetrics.find()
      .sort({ totalRevenue: -1 })
      .limit(10);
    
    return res.json({ success: true, data: topMovies });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Overall Platform Summary (Total tickets, revenue, cancellation rate)
exports.getPlatformSummary = async (req, res) => {
  try {
    const summary = await MovieMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalTickets: { $sum: '$totalTicketsSold' },
          totalBookings: { $sum: '$totalBookings' },
          totalCancellations: { $sum: '$totalCancellations' }
        }
      }
    ]);

    return res.json({ success: true, data: summary[0] || {} });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
