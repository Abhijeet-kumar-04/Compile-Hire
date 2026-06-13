const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Strict Auth Middleware: Rejects any request without a valid token
const requireAuth = ClerkExpressRequireAuth();

module.exports = { requireAuth };
