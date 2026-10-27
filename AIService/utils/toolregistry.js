const axios = require("axios");


const MOVIE_BOOKING_URL = process.env.MOVIE_BOOKING_URL || "http://localhost:3000";

// Separate helper to run tools cleanly
async function executeTool(functionName, args = {}, req = {}) {
    args = args || {};
    if (functionName === "get_currently_playing_movies") {
        try {
            const response = await axios.get(`${MOVIE_BOOKING_URL}/mba/api/v1/movies`);
            const cleanMovies = (response.data?.data || []).map(m => ({
                id: m._id,
                name: m.name,
                description: m.description,
                casts: m.casts
            }));
            return JSON.stringify({ movies: cleanMovies });
        } catch (err) {
            return JSON.stringify({ error: "Failed to fetch currently playing movies" });
        }
    }

    if (functionName === "semantic_search_movie") {
        try {
            const query = args.query || args.name || "";
            const response = await axios.post(`${MOVIE_BOOKING_URL}/mba/api/v1/movies/semantic-search`, {
                name: query
            });
            return JSON.stringify(response.data);
        } catch (err) {
            return JSON.stringify({ error: "Movie search failed" });
        }
    }

    if (functionName === "get_available_shows") {
        try {
            const params = { movieId: args.movieId };
            if (args.theatreId) params.theatreId = args.theatreId;

            const response = await axios.get(`${MOVIE_BOOKING_URL}/mba/api/v1/shows`, { params });
            const shows = (response.data?.data || []).map(s => ({
                showId: s._id,
                theatreName: s.theatreId?.name || "Theatre",
                theatreId: s.theatreId?._id || s.theatreId,
                timing: s.timing,
                price: s.price,
                availableSeats: (s.noOfSeats || 0) - (s.occupiedSeats?.length || 0),
                occupiedSeats: s.occupiedSeats || []
            }));
            return JSON.stringify({ shows });
        } catch (err) {
            return JSON.stringify({ error: "Failed to fetch shows" });
        }
    }

    if (functionName === "initiate_booking") {
        // Forward auth token from the client request
        const headers = req?.headers || {};
        const token = headers["x-access-token"] || headers["authorization"]?.replace(/^Bearer\s+/i, "");
        if (!token) {
            return JSON.stringify({
                error: "User is not logged in. Please provide an access token to complete the booking.",
                requiresAuth: true
            });
        }

        try {
            const response = await axios.post(`${MOVIE_BOOKING_URL}/mba/api/v1/bookings`, {
                movieId: args.movieId,
                theatreId: args.theatreId,
                timing: args.timing,
                seats: Array.isArray(args.seats) ? args.seats : [args.seats]
            }, {
                headers: { "x-access-token": token }
            });
            return JSON.stringify({ success: true, booking: response.data?.data });
        } catch (err) {
            return JSON.stringify({ error: err.response?.data?.err || "Booking failed" });
        }
    }

    return JSON.stringify({ error: `Unknown tool: ${functionName}` });
}

module.exports = { executeTool };
