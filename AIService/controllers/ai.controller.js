const llmService = require("../services/groq.service");
const { executeTool } = require("../utils/toolregistry");
const sessionService = require("../services/session.service");
const { validateInput } = require("../guardrails/input.guardrails");


exports.startSession = async (req, res) => {
    try {
        const sessionId = await sessionService.createSession();
        return res.json({
            success: true,
            sessionId
        });
    } catch (error) {
        console.error("Error creating AI session:", error);
        return res.status(500).json({ success: false, error: "Failed to initialize session" });
    }
};

exports.handleChat = async (req, res) => {
    const { sessionId } = req.body;
    const message = req.body.message || req.body.messages;

    if (!sessionId || !message) {
        return res.status(400).json({ success: false, error: "sessionId and message are required" });
    }

    // Apply input guardrails
    const validation = validateInput(message);
    if (!validation.pass) {
        return res.status(400).json({
            success: false,
            error: validation.reason
        });
    }
    // Set SSE headers for real-time streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    const sendEvent = (event, data) => {
        if (!res.writableEnded) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    };

    try {
        const session = await sessionService.getSession(sessionId);
        if (!session) {
            sendEvent("error", { error: "Session not found or expired" });
            return res.end();
        }

        session.messages.push({ role: "user", content: message });

        let aiMessage = await llmService.streamChatCompletion(
            session.messages,
            (chunk) => sendEvent("chunk", chunk)
        );

        // Tool Calling Loop (up to 5 turns)
        let maxTurns = 5;
        while (aiMessage.tool_calls?.length > 0 && maxTurns-- > 0) {
            session.messages.push(aiMessage);

            for (const toolCall of aiMessage.tool_calls) {
                sendEvent("tool_start", { tool: toolCall.function.name });

                let args = {};
                try {
                    args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};
                } catch (err) {
                    console.warn("Failed to parse tool arguments:", toolCall.function?.arguments);
                    args = {};
                }

                const result = await executeTool(toolCall.function.name, args, req);

                session.messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: typeof result === "string" ? result : JSON.stringify(result)
                });

                sendEvent("tool_end", { tool: toolCall.function.name });
            }

            aiMessage = await llmService.streamChatCompletion(
                session.messages,
                (chunk) => sendEvent("chunk", chunk)
            );
        }

        session.messages.push(aiMessage);
        await sessionService.updateSession(sessionId, session.messages);

        sendEvent("done", { sessionId, response: aiMessage.content || "" });
        res.end();

    } catch (error) {
        console.error("AI Streaming Error:", error);
        sendEvent("error", { error: error.message || "AI Service Error" });
        res.end();
    }
};

