async function callGroqWithFallback(groqInstance, messages, responseFormat = null) {
    const models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
    ];

    let lastError = null;
    for (const model of models) {
        try {
            const options = { messages, model };
            if (responseFormat) options.response_format = responseFormat;
            
            const completion = await groqInstance.chat.completions.create(options);
            console.log(`[Groq] Successfully used model: ${model}`);
            return completion;
        } catch (error) {
            console.warn(`[Groq Fallback] Model ${model} failed: ${error.message}`);
            lastError = error;
            // Only fallback if rate limited (429) or server error (500/503)
            if (error.status === 429 || error.status >= 500) {
                continue;
            }
            throw error;
        }
    }
    throw new Error(`All Groq fallback models failed. Last error: ${lastError?.message}`);
}

module.exports = callGroqWithFallback;
