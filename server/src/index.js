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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
