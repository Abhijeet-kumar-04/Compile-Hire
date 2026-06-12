require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const Groq = require('groq-sdk');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Helper to cascade through AI models if one hits a rate limit
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

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Protected Routes (Require Clerk Authentication)
app.get('/api/protected', (req, res) => {
    res.json({ status: 'ok', message: 'You are authenticated!', userId: req.auth.userId });
});

// User Sync Endpoint (Called after frontend login)
app.post('/api/users/sync', async (req, res) => {
    try {
        const { userId } = req.auth;
        const { email, name } = req.body;
        
        // Upsert user in database
        const user = await prisma.user.upsert({
            where: { clerkId: userId },
            update: { email, name },
            create: { clerkId: userId, email, name: name || 'Anonymous' }
        });
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

// Code Execution Endpoint via Judge0 API
app.post('/api/execute', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        // Judge0 API language IDs
        const languageIds = {
            javascript: 93, // Node.js 18.15.0
            python: 71,     // Python 3.11.2
            cpp: 54,        // C++ (GCC 9.2.0)
            java: 62        // Java (OpenJDK 13.0.1)
        };

        const langId = languageIds[language] || 93;

        if (!process.env.RAPIDAPI_KEY) {
            return res.status(500).json({ error: 'RAPIDAPI_KEY is not configured on the server.' });
        }

        const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY
            },
            body: JSON.stringify({
                source_code: code,
                language_id: langId
            })
        });

        const result = await response.json();
        
        // Map Judge0 response back to what the frontend expects
        const output = result.stdout || result.stderr || result.compile_output || result.message || "Code executed successfully with no output.";
        res.json({ run: { output: output } });
        
    } catch (error) {
        console.error('Code execution error:', error);
        res.status(500).json({ error: 'Execution failed' });
    }
});

// AI Interview Chat Endpoint via Groq (Llama 3)
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, currentCode, preferences = {}, elapsedMinutes = 0 } = req.body;
        const { company = "a tech company", category = "algorithms", role = "Software Engineer" } = preferences;
        
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        // Extract the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const promptText = lastUserMessage ? lastUserMessage.text : "Hello, I am ready to begin.";
        
        const chatCompletion = await callGroqWithFallback(groq, [
            { role: "system", content: systemPrompt },
            { role: "user", content: promptText }
        ]);
        
        const responseText = chatCompletion.choices[0]?.message?.content || "";
        res.json({ text: responseText });
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: 'Failed to generate AI response: ' + error.message });
    }
});

// Dynamic AI Initialization Endpoint
app.post('/api/init-interview', async (req, res) => {
    try {
        const { company = "a tech company", category = "algorithms", role = "Software Engineer", language = "javascript" } = req.body || {};

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        const chatCompletion = await callGroqWithFallback(
            groq, 
            [{ role: "user", content: prompt }], 
            { type: "json_object" }
        );
        
        let rawText = chatCompletion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(rawText);
        res.json(parsed);
    } catch (error) {
        console.error('Init API error:', error);
        res.status(500).json({ 
            message: "Welcome to your mock interview. It seems my brain is offline, but let's reverse a linked list anyway.", 
            template: "// Write your solution here\n\nfunction reverseLinkedList(head) {\n  \n}\n\nreverseLinkedList();" 
        });
    }
});

// End Interview & Generate Report Endpoint (no auth required - works for all users)
app.post('/api/interview/end', async (req, res) => {
    try {
        const { messages, finalCode, language, preferences = {} } = req.body;
        const { company = 'a tech company', category = 'algorithms', role = 'Software Engineer' } = preferences;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY is missing.' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

        const chatCompletion = await callGroqWithFallback(
            groq, 
            [{ role: "user", content: prompt }], 
            { type: "json_object" }
        );
        
        let rawText = chatCompletion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(rawText);

        // Try to save to DB (optional - won't fail the request if it errors)
        let savedId = null;
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader && process.env.CLERK_SECRET_KEY) {
                const { verifyToken } = require('@clerk/backend');
                const payload = await verifyToken(authHeader.replace('Bearer ', ''), { secretKey: process.env.CLERK_SECRET_KEY });
                const clerkId = payload.sub;
                let user = await prisma.user.findUnique({ where: { clerkId } });
                
                if (!user) {
                    // Auto-create user profile in database
                    user = await prisma.user.create({
                        data: {
                            clerkId,
                            email: req.body.candidateEmail || `${clerkId}@placeholder.com`,
                            name: req.body.candidateName || "Candidate"
                        }
                    });
                }

                if (user) {
                    const sessionData = { 
                        overallScore: parsed.overallScore || 0,
                        duration: req.body.duration || 0,
                        verdict: parsed.verdict || "Borderline",
                        feedback: parsed.feedback || "Interview complete.",
                        strengths: parsed.strengths || [],
                        improvements: parsed.improvements || [],
                        breakdown: {
                            problemSolving:   parsed.problemSolving   || 0,
                            codeQuality:      parsed.codeQuality      || 0,
                            edgeCaseHandling: parsed.edgeCaseHandling || 0,
                            communication:    parsed.communication    || 0,
                            timeComplexity:   parsed.timeComplexity   || 0,
                            technicalDepth:   parsed.technicalDepth   || 0,
                        },
                        candidateName: user.name || "Candidate",
                        preferences: req.body.preferences || {}
                    };

                    const session = await prisma.interviewSession.create({
                        data: { 
                            userId: user.id, 
                            status: "completed", 
                            duration: req.body.duration || 0,
                            overallScore: parsed.overallScore || 0, 
                            feedback: parsed.feedback || "",
                            reportData: sessionData
                        }
                    });
                    savedId = session.id;
                }
            }
        } catch (dbErr) {
            console.warn('DB save skipped:', dbErr.message);
        }

        res.json({ 
            success: true,
            savedId,
            session: { 
                overallScore: parsed.overallScore || 0,
                duration: req.body.duration || 0,
                verdict: parsed.verdict || "Borderline",
                feedback: parsed.feedback || "Interview complete.",
                strengths: parsed.strengths || [],
                improvements: parsed.improvements || [],
                breakdown: {
                    problemSolving:   parsed.problemSolving   || 0,
                    codeQuality:      parsed.codeQuality      || 0,
                    edgeCaseHandling: parsed.edgeCaseHandling || 0,
                    communication:    parsed.communication    || 0,
                    timeComplexity:   parsed.timeComplexity   || 0,
                    technicalDepth:   parsed.technicalDepth   || 0,
                }
            }
        });
    } catch (error) {
        console.error('End API error:', error);
        res.status(500).json({ error: 'Failed to generate report: ' + error.message });
    }
});

// Get User Interview History
app.get('/api/history', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !process.env.CLERK_SECRET_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { verifyToken } = require('@clerk/backend');
        const payload = await verifyToken(authHeader.replace('Bearer ', ''), { secretKey: process.env.CLERK_SECRET_KEY });
        const clerkId = payload.sub;
        
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const history = await prisma.interviewSession.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(history);
    } catch (error) {
        console.error('History API error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get Specific Interview Result
app.get('/api/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const session = await prisma.interviewSession.findUnique({
            where: { id }
        });
        if (!session) return res.status(404).json({ error: 'Report not found' });
        
        // Return the stored reportData directly
        const report = session.reportData || {};
        report.completedAt = session.createdAt;
        
        res.json({ session: report });
    } catch (error) {
        console.error('Results API error:', error);
        res.status(500).json({ error: 'Failed to fetch result' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
