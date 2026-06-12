require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Protected Routes (Require Clerk Authentication)
app.get('/api/protected', ClerkExpressRequireAuth({}), (req, res) => {
    res.json({ status: 'ok', message: 'You are authenticated!', userId: req.auth.userId });
});

// User Sync Endpoint (Called after frontend login)
app.post('/api/users/sync', ClerkExpressRequireAuth({}), async (req, res) => {
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
