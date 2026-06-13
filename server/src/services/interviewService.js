const prisma = require('../config/prisma');

async function createInterviewSession(userId, data) {
    return await prisma.interviewSession.create({
        data: {
            userId,
            status: "completed",
            duration: data.duration || 0,
            overallScore: data.overallScore || 0,
            feedback: data.feedback || "",
            reportData: data
        }
    });
}

async function getInterviewHistory(userId) {
    return await prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
}

async function getInterviewResult(id) {
    return await prisma.interviewSession.findUnique({ where: { id } });
}

module.exports = { createInterviewSession, getInterviewHistory, getInterviewResult };
