const axios = require("axios"); // Install axios for inter-service communication
const groqService = require("../services/groq.service");

exports.handleChat = async (req, res) => {
    try {
        // Expecting { messages: [{role: "user", content: "..."}] }
        const { messages } = req.body; 

        // 1. Send to Groq
        let aiMessage = await groqService.getChatCompletion(messages);
        console.log(aiMessage);
        // 2. Check if Groq wants to call a tool
        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
            
            messages.push(aiMessage); // Append AI's tool request to history
            
            for (const toolCall of aiMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                console.log(args);
                let toolResult = "";

                // 3. Execute the specific tool by calling Movie_Booking Microservice
                if (functionName === "get_currently_playing_movies") {
                    // Call your core service!
                    const response = await axios.get(`${process.env.MOVIE_BOOKING_URL}/mba/api/v1/movies`);
                    toolResult = JSON.stringify(response.data);
                } 
                  else if (functionName === "semantic_search_movie") {
                    try {
                        const response = await axios.post(`${process.env.MOVIE_BOOKING_URL}/mba/api/v1/movies/semantic-search`, { 
                            name: args.name 
                        });
                        // Send the found movie (including its _id) back to Groq
                        toolResult = JSON.stringify(response.data);
                    } catch (err) {
                        console.error("Error in semantic search tool:", err.response?.data || err.message);
                        toolResult = JSON.stringify({ error: "Movie not found" });
                    }
                } 
                
                else if(functionName==="initiate_booking"){
                    try{
                        const token=req.headers['x-access-token'];
                        if(!token){
                            toolResult=JSON.stringify({
                                error:"User is not logged in. Tell the user to please provide an auth token."
                            })
                        }
                        else{
                            const response=await axios.post(`${process.env.MOVIE_BOOKING_URL}/mba/api/v1/bookings`,args,{
                                headers:{
                                    "x-access-token":token
                                }
                            });
                            toolResult=JSON.stringify(response.data);
                        }
                    }
                    catch(error){
                        toolResult=JSON.stringify({
                            error:"Failed to initiate booking."
                        });
                    }
                }
                else if (functionName === "get_available_shows") {
    try {
        // Fetch shows from the Movie Booking backend filtering by movieId
        const response = await axios.get(`${process.env.MOVIE_BOOKING_URL}/mba/api/v1/shows?movieId=${args.movieId}`);
        
        // This will return the theatreId, timing, and price to the AI!
        toolResult = JSON.stringify(response.data);
    } catch (err) {
        toolResult = JSON.stringify({ error: "Could not fetch shows for this movie." });
    }
}

                // 4. Append tool result to history
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: toolResult
                });
            }

            // 5. Send results back to Groq to formulate final English response
            aiMessage = await groqService.getChatCompletion(messages);
        }

        messages.push(aiMessage);
        res.status(200).json({ success: true, messages: messages });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "AI Service Error" });
    }
};
