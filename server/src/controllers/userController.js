const userService = require('../services/userService');

async function syncUser(req, res) {
    try {
        const { userId } = req.auth;
        const { email, name } = req.body;
        
        const user = await userService.upsertUser(userId, email, name);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
}

module.exports = { syncUser };
