const redisClient = require('../utils/redisClient');

const cacheMovies = async (req, res, next) => {
    try {
        const cacheKey = 'movies_catalog';
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log('Serving from Redis Cache');
            return res.status(200).json({
                success: true,
                message: 'Successfully fetched movies from cache',
                data: JSON.parse(cachedData)
            });
        }
        next(); // If not in cache, proceed to the actual controller
    } catch (error) {
        console.error('Redis Cache Error:', error);
        next(); // Fallback to DB if Redis fails
    }
};

module.exports = { cacheMovies };
