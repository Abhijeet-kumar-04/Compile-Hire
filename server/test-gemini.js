require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        console.log("Testing with key:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent("Hello!");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Full Error:", e);
    }
}
test();
