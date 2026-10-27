const Groq = require("groq-sdk");
const {SYSTEM_PROMPT}=require("../prompts/ai.prompts.js");
const{tools}=require("../tools/movie.tools.js");

const groq=new Groq({apiKey:process.env.GROQ_API_KEY});
async function streamChatCompletion(messages, onChunk) {
    const fullMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
    ];
    const stream = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: fullMessages,
        tools: tools,
        tool_choice: "auto",
        temperature: 0.2,
        stream: true    // ← this enables token-by-token delivery
    });
    let fullContent = "";
    let toolCalls = [];
    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        // Stream text content to the client immediately
        if (delta?.content) {
            fullContent += delta.content;
            onChunk({ type: "content", data: delta.content });
        }
        // Accumulate tool call fragments (they arrive in pieces)
        if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
                if (tc.index !== undefined) {
                    if (!toolCalls[tc.index]) {
                        toolCalls[tc.index] = {
                            id: tc.id || "", type: "function",
                            function: { name: "", arguments: "" }
                        };
                    }
                    if (tc.id) toolCalls[tc.index].id = tc.id;
                    if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
                    if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
                }
            }
        }
    }
    return {
        role: "assistant",
        content: fullContent || null,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
    };
}

module.exports = { streamChatCompletion };
