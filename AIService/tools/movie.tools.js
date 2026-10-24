const tools = [
    {
        type: "function",
        function: {
            name: "get_currently_playing_movies",
            description: "Get a list of all movies currently playing in theatres, including IDs, titles, descriptions, and cast.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "semantic_search_movie",
            description: "Perform a semantic search to find movies by name, plot theme, genre, vibe, or actor.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The movie name or plot description to search for (e.g. 'sci-fi time travel', 'Batman')."
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_available_shows",
            description: "Retrieve all available showtimes, theatres, ticket prices, and seat availability for a specific movie.",
            parameters: {
                type: "object",
                properties: {
                    movieId: {
                        type: "string",
                        description: "The MongoDB ObjectID of the movie."
                    },
                    theatreId: {
                        type: "string",
                        description: "Optional theatre ID if filtering by a specific venue."
                    }
                },
                required: ["movieId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "initiate_booking",
            description: "Book movie tickets for a specific showtime and seats at a given theatre. Call this only once the user has chosen their seats.",
            parameters: {
                type: "object",
                properties: {
                    movieId: {
                        type: "string",
                        description: "The MongoDB ObjectID of the movie."
                    },
                    theatreId: {
                        type: "string",
                        description: "The MongoDB ObjectID of the theatre."
                    },
                    timing: {
                        type: "string",
                        description: "The selected show timing matching the show (e.g. '10:00 AM')."
                    },
                    seats: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of seat codes, e.g. ['A1', 'A2']."
                    }
                },
                required: ["movieId", "theatreId", "timing", "seats"]
            }
        }
    }
];

module.exports = { tools };
