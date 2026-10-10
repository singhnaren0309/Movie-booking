const Groq = require("groq-sdk");
const {SYSTEM_PROMPT}=require("../prompts/ai.prompts.js");
const{tools}=require("../tools/movie.tools.js");

const groq=new Groq({apiKey:process.env.GROQ_API_KEY});
async function getChatCompletion(messages){
    const fullMessages=[
        {
            role: "system", content: SYSTEM_PROMPT
        },
        ...messages
    ];
    try{
 const response=await groq.chat.completions.create({

  "model": "openai/gpt-oss-120b",
   messages: fullMessages,
   tools: tools,
   tool_choice: "auto",
   temperature: 0.2, 
 
});
    return response.choices[0].message;
    }
    catch(error){
        console.error("Groq API Error:",error);
        throw new Error("Failet to connect to ai provider");
    }
}

module.exports={getChatCompletion}

