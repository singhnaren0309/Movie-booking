const redis = require("redis");
const { v4: uuid } = require("uuid");

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redisClient.on("error", (err) => console.error("Redis Error in SessionService:", err));

// Ensure connection is established
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
})();

async function ensureConnected() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error("Redis reconnection failed:", err);
        throw err;
    }
}

const SESSION_TTL = 60 * 60; // 1 hour
const MAX_MESSAGE_HISTORY = 50;

async function createSession() {
    await ensureConnected();
    const sessionId = uuid();
    await redisClient.set(
        `session:${sessionId}`,
        JSON.stringify({ messages: [], createdAt: Date.now() }),
        { EX: SESSION_TTL }
    );
    return sessionId;
}

async function getSession(sessionId) {
    await ensureConnected();
    const data = await redisClient.get(`session:${sessionId}`);
    if (!data) return null;
    const session = JSON.parse(data);
    if (!session.messages) session.messages = [];
    return session;
}

async function updateSession(sessionId, messages) {
    await ensureConnected();
    const trimmed = messages.slice(-MAX_MESSAGE_HISTORY);
    await redisClient.set(
        `session:${sessionId}`,
        JSON.stringify({ messages: trimmed, updatedAt: Date.now() }),
        { EX: SESSION_TTL }
    );
}

async function deleteSession(sessionId) {
    await ensureConnected();
    await redisClient.del(`session:${sessionId}`);
}

module.exports = {
    createSession,
    getSession,
    updateSession,
    deleteSession
};
