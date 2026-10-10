const tools = [
    {
        type: "function",
        function: {
            name: "get_currently_playing_movies",
            description: "Get a list of all movies currently playing in theatres.",
            parameters:{
                type: "object",
                properties:{},
                required:[],
            },
        },
    },
    {
        type: "function",
        function:{
            name:"initiate_booking",
            description: "call this when the use explicitly confirms they want to book a ticket.",
            parameters:{
                type:"object",
                properties:{
                    movieId:{
                        type:"string",
                        description:"The exact MongoDB objectId of the movie",
                    },
                    theatreId:{
                        type:"string",
                        description:"The exact MongoDB objectId of the theatre",
                    },
                    timing:{
                        type:"string",
                        description:"The timing of the show the user wants to book.",
                    },
                    noOfSeats:{
                        type:"number",
                        description:"The number of seats the user wants to book.",
                    },
                },
                required:["movieId","theatreId","timing","noOfSeats"],
            },
        },
    },
     {
    type: "function",
    function: {
      name: "semantic_search_movie",
      description: "Search for a movie by name or description .",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the movie (e.g. Inception)" }
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_theatre",
      description: "Search for a theatre by its name to get its exact MongoDB ObjectId. Run this BEFORE booking if you don't know the theatreId.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the theatre (e.g. PVR)" }
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
        name: "get_available_shows",
        description: "CRITICAL: You MUST use this tool to fetch actual show timings for a movie. Do NOT hallucinate or make up theatre names and timings. Use this AFTER finding the movieId.",
        parameters: {
            type: "object",
            properties: {
                movieId: {
                    type: "string",
                    description: "The exact MongoDB objectId of the movie"
                }
            },
            required: ["movieId"],
        },
    },
}


    
]
module.exports={tools};

