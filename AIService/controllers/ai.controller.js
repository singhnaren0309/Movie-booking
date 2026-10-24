
const groqService = require("../services/groq.service");
const { executeTool } = require("../utils/toolregistry");

exports.handleChat = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: "messages array is required" });
        }

        // 1. Initial completion from Groq
        let aiMessage = await groqService.getChatCompletion(messages);

        // 2. Multi-turn tool execution loop
        let maxTurns = 5;
        while (aiMessage.tool_calls && aiMessage.tool_calls.length > 0 && maxTurns > 0) {
            maxTurns--;
            messages.push(aiMessage);

            for (const toolCall of aiMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                console.log(`[AI TOOL] Executing ${functionName} with args:`, args);

                const toolResult = await executeTool(functionName, args, req);

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: toolResult
                });
            }

            // Send tool outputs back to Groq for next step or final answer
            aiMessage = await groqService.getChatCompletion(messages);
        }

        messages.push(aiMessage);
        return res.status(200).json({ success: true, messages: messages });

    } catch (error) {
        console.error("AI Service Error:", error);
        return res.status(500).json({ success: false, error: "AI Service Error" });
    }
};
