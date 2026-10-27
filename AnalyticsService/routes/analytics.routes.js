const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/top-movies', analyticsController.getTopMovies);
router.get('/summary', analyticsController.getPlatformSummary);

module.exports = router;
