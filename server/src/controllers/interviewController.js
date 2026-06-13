const aiService = require('../services/aiService');
const interviewService = require('../services/interviewService');
const userService = require('../services/userService');
const { verifyToken } = require('@clerk/backend');

async function chat(req, res) {
    try {
        const { messages, currentCode, preferences = {}, elapsedMinutes = 0 } = req.body;
        const responseText = await aiService.generateChatResponse(messages, currentCode, preferences, elapsedMinutes);
        res.json({ text: responseText });
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: 'Failed to generate AI response: ' + error.message });
    }
}

async function initInterview(req, res) {
    try {
        const { company = "a tech company", category = "algorithms", role = "Software Engineer", language = "javascript" } = req.body || {};
        const parsed = await aiService.generateInitialQuestion(company, category, role, language);
        res.json(parsed);
    } catch (error) {
        console.error('Init API error:', error);
        res.status(500).json({ 
            message: "Welcome to your mock interview. It seems my brain is offline, but let's reverse a linked list anyway.", 
            template: "// Write your solution here\n\nfunction reverseLinkedList(head) {\n  \n}\n\nreverseLinkedList();" 
        });
    }
}

async function endInterview(req, res) {
    try {
        const { messages, finalCode, language, preferences = {} } = req.body;
        const parsed = await aiService.generateInterviewReport(messages, finalCode, language, preferences);

        // Optional DB Save
        let savedId = null;
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader && process.env.CLERK_SECRET_KEY) {
                const payload = await verifyToken(authHeader.replace('Bearer ', ''), { secretKey: process.env.CLERK_SECRET_KEY });
                const clerkId = payload.sub;
                
                let user = await userService.getUserByClerkId(clerkId);
                if (!user) {
                    user = await userService.createUser(clerkId, req.body.candidateEmail, req.body.candidateName);
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

                    const session = await interviewService.createInterviewSession(user.id, sessionData);
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
}

async function getHistory(req, res) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !process.env.CLERK_SECRET_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const payload = await verifyToken(authHeader.replace('Bearer ', ''), { secretKey: process.env.CLERK_SECRET_KEY });
        const clerkId = payload.sub;
        
        const user = await userService.getUserByClerkId(clerkId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const history = await interviewService.getInterviewHistory(user.id);
        res.json(history);
    } catch (error) {
        console.error('History API error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}

async function getResult(req, res) {
    try {
        const { id } = req.params;
        const session = await interviewService.getInterviewResult(id);
        if (!session) return res.status(404).json({ error: 'Report not found' });
        
        const report = session.reportData || {};
        report.completedAt = session.createdAt;
        
        res.json({ session: report });
    } catch (error) {
        console.error('Results API error:', error);
        res.status(500).json({ error: 'Failed to fetch result' });
    }
}

module.exports = { chat, initInterview, endInterview, getHistory, getResult };
