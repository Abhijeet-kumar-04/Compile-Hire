const Groq = require('groq-sdk');
const callGroqWithFallback = require('../utils/groqFallback');

function getGroqInstance() {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
        throw new Error('GROQ_API_KEY is not configured on the server.');
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function generateChatResponse(messages, currentCode, preferences, elapsedMinutes) {
    const groq = getGroqInstance();
    const { company = "a tech company", category = "algorithms", role = "Software Engineer" } = preferences;
    
    const systemPrompt = `You are an expert AI Senior Software Engineer at ${company} conducting a technical mock interview for a ${role} position. 
The interview focus is strictly on "${category}". The candidate has been interviewing for ${elapsedMinutes} minutes.
The candidate is currently looking at this code in their editor:
\`\`\`
${currentCode || '// No code written yet.'}
\`\`\`
Analyze their code, logic, and their last message. Respond professionally and concisely. 
CRITICAL RULE 1: Always actively look for missing Edge Cases. If their code does not handle an edge case, grill them on it.
CRITICAL RULE 2: If the category is NOT "Data Structures & Algorithms", DO NOT ask Leetcode/DSA questions. Keep questions heavily focused on practical ${category} concepts (e.g. UI hooks for Frontend, Architecture for Backend, Mobile concepts for Mobile, SQL for Database).
PROGRESSION RULE: Based on their answers, ask cross-questions. If they solve the problem optimally and time permits (elapsedMinutes < 40), proceed to ask a follow-up or a new ${category} question.
TIME MANAGEMENT RULE: If elapsedMinutes >= 45, do not ask new questions. Let them finish their current thought, and end the interview gracefully with a concluding message indicating time is up. 
Keep your response short, conversational, and direct as if speaking in a real interview.`;

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const promptText = lastUserMessage ? lastUserMessage.text : "Hello, I am ready to begin.";
    
    const chatCompletion = await callGroqWithFallback(groq, [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText }
    ]);
    
    return chatCompletion.choices[0]?.message?.content || "";
}

async function generateInitialQuestion(company, category, role, language) {
    const groq = getGroqInstance();
    const prompt = `You are an expert AI Senior Software Engineer at ${company} preparing to conduct a mock interview for a ${role} position.
Your task is to generate ONE random coding or technical problem that is STRICTLY related to the category: "${category}".
CRITICAL: Do NOT ask basic Data Structures & Algorithms questions (like Two Sum, Valid Parentheses) UNLESS the category is specifically "Data Structures & Algorithms".
If the category is Frontend, ask a React/UI question. If Backend, ask an API/Server question. If Mobile, ask an iOS/Android/React Native specific question. If Data Science, ask a data manipulation/ML question.

Respond EXACTLY with a raw JSON object (no markdown formatting, no backticks) containing two keys:
1. "message": Your opening greeting where you introduce yourself as an interviewer at ${company} and clearly state the specific ${category} problem they need to solve. Make it conversational.
2. "template": The starter code for the problem written entirely in ${language.toUpperCase()}. Use comments to describe the problem and constraints.

Example JSON output format:
{
  "message": "Welcome to your mock interview! Today, I want you to write a function that...",
  "template": "// Problem description here...\\n\\nfunction solveProblem() {\\n  // Your code here\\n}\\n"
}`;

    const chatCompletion = await callGroqWithFallback(groq, [{ role: "user", content: prompt }], { type: "json_object" });
    const rawText = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(rawText);
}

async function generateInterviewReport(messages, finalCode, language, preferences) {
    const groq = getGroqInstance();
    const { company = 'a tech company', category = 'algorithms', role = 'Software Engineer' } = preferences;

    const prompt = `You are a strict, objective senior technical interviewer at ${company}. You just finished a ${role} interview focused on ${category}.

Analyze the transcript and final code below, then return a structured JSON performance report.

INTERVIEW TRANSCRIPT:
${(messages || []).map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n')}

FINAL CODE SUBMITTED (${language || 'javascript'}):
\`\`\`
${finalCode || '// No code submitted'}
\`\`\`

CRITICAL GRADING ALGORITHM - YOU MUST FOLLOW THESE RULES:
1. UNATTEMPTED CODE: If the code is almost empty, identical to the initial template, or clearly incomplete, you MUST score "problemSolving", "codeQuality", "edgeCaseHandling", and "timeComplexity" strictly between 0.0 and 2.0. Do not hallucinate competence.
2. NO COMMUNICATION: If the transcript contains fewer than 2 meaningful technical messages from the candidate, "communication" MUST be scored below 3.0.
3. BE HARSH BUT FAIR: Do not give average scores (5.0-7.0) out of politeness. A failed or unattempted interview is a "Strong No Hire" with low scores across the board.

Score the candidate on EXACTLY these 6 parameters, each from 0.0 to 10.0:
1. "problemSolving"      — Ability to understand the problem, devise an algorithm, and arrive at a correct solution
2. "codeQuality"         — Cleanliness, readability, naming conventions, structure, and correctness of the code
3. "edgeCaseHandling"    — Whether they identified and handled edge cases (nulls, empty inputs, overflow, duplicates, etc.)
4. "communication"       — How clearly they explained their thinking, asked clarifying questions, and engaged with the interviewer
5. "timeComplexity"      — Awareness and optimization of time and space complexity (Big-O)
6. "technicalDepth"      — Depth of knowledge in ${category} — concepts, theory, trade-offs

Also provide:
- "overallScore": weighted average (problemSolving×0.25 + codeQuality×0.20 + edgeCaseHandling×0.15 + communication×0.15 + timeComplexity×0.15 + technicalDepth×0.10), rounded to 1 decimal
- "verdict": one of "Strong Hire", "Hire", "Borderline", "No Hire", "Strong No Hire" — based on overall score
- "feedback": 2-3 paragraph detailed narrative feedback explicitly mentioning their lack of effort if they submitted empty code
- "strengths": exactly 3 specific strength bullet strings (if they failed completely, put things like "Showed up", "Polite greeting", etc.)
- "improvements": exactly 3 specific improvement action strings

Return ONLY valid JSON. No markdown, no explanation.`;

    const chatCompletion = await callGroqWithFallback(groq, [{ role: "user", content: prompt }], { type: "json_object" });
    const rawText = chatCompletion.choices[0]?.message?.content || "{}";
    return JSON.parse(rawText);
}

module.exports = { generateChatResponse, generateInitialQuestion, generateInterviewReport };
