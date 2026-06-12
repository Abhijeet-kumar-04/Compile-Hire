require('dotenv').config();
const Groq = require('groq-sdk');

async function test() {
    try {
        console.log("Testing with key:", process.env.GROQ_API_KEY.substring(0, 8) + "...");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello!" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("Success:", chatCompletion.choices[0]?.message?.content);
    } catch (e) {
        console.error("Full Error:", e);
    }
}
test();
