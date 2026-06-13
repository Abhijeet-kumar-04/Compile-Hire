const prisma = require('../config/prisma');

async function upsertUser(clerkId, email, name) {
    return await prisma.user.upsert({
        where: { clerkId },
        update: { email, name },
        create: { clerkId, email, name: name || 'Anonymous' }
    });
}

async function getUserByClerkId(clerkId) {
    return await prisma.user.findUnique({ where: { clerkId } });
}

async function createUser(clerkId, email, name) {
    return await prisma.user.create({
        data: {
            clerkId,
            email: email || `${clerkId}@placeholder.com`,
            name: name || "Candidate"
        }
    });
}

module.exports = { upsertUser, getUserByClerkId, createUser };
