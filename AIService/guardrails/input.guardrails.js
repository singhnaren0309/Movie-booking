/**
 * Input Guardrails — Validates and sanitizes user input BEFORE it reaches the LLM.
 *
 * These run as a pipeline: each guard returns { pass: true } or { pass: false, reason }.
 * If any guard fails, the request is rejected without ever calling the LLM,
 * saving tokens and preventing abuse.
 */
// ── Prompt Injection Detection ──
// Detects common injection patterns that try to override the system prompt.
// This is a heuristic approach; for production, consider a classifier model.
const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
    /you\s+are\s+now\s+a/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /\<\|im_start\|\>/i,
    /forget\s+(everything|all|your)\s+(you|instructions)/i,
    /do\s+not\s+follow\s+(your|the)\s+(rules|instructions)/i,
    /pretend\s+(you\s+are|to\s+be)/i,
    /act\s+as\s+(if|a|an)\b/i,
    /override\s+(system|safety|content)/i
];
function detectPromptInjection(message) {
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(message)) {
            return {
                pass: false,
                reason: "Your message was flagged by our safety system. Please rephrase."
            };
        }
    }
    return { pass: true };
}
// ── PII Scanner ──
// Detects credit cards, SSNs, phone numbers in user input
// and warns the user not to share sensitive data.
const PII_PATTERNS = [
    { name: "credit_card", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/ },
    { name: "ssn",         regex: /\b\d{3}-\d{2}-\d{4}\b/ },
    { name: "email",       regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/i },
    { name: "phone",       regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/ }
];
function scanForPII(message) {
    const detected = [];
    for (const { name, regex } of PII_PATTERNS) {
        if (regex.test(message)) detected.push(name);
    }
    if (detected.length > 0) {
        return {
            pass: false,
            reason: `Please don't share sensitive information (${detected.join(", ")}). I don't need it to help you book movies.`
        };
    }
    return { pass: true };
}
// ── Scope Check ──
// Ensures the message is roughly about movies/entertainment.
// Uses a simple keyword absence heuristic.
const OFF_TOPIC_PATTERNS = [
    /write\s+(me\s+)?(a\s+)?(python|javascript|code|script|program)/i,
    /hack\s+(into|this)/i,
    /how\s+to\s+(make|build)\s+(a\s+)?(bomb|weapon|drug)/i
];
function checkScope(message) {
    for (const pattern of OFF_TOPIC_PATTERNS) {
        if (pattern.test(message)) {
            return {
                pass: false,
                reason: "I'm a movie booking assistant. I can help you find movies, check showtimes, and book tickets!"
            };
        }
    }
    return { pass: true };
}
// ── Length Check ──
function checkLength(message, maxLength = 2000) {
    if (typeof message !== "string" || message.trim().length === 0) {
        return { pass: false, reason: "Message must be a non-empty string." };
    }
    if (message.length > maxLength) {
        return { pass: false, reason: `Message too long (max ${maxLength} characters).` };
    }
    return { pass: true };
}
// ── Pipeline Runner ──
// Runs all guards in sequence. Returns the first failure or { pass: true }.
function validateInput(message) {
    if (typeof message !== "string" || message.trim().length === 0) {
        return { pass: false, reason: "Message must be a non-empty string." };
    }
    const guards = [
        checkLength(message),
        detectPromptInjection(message),
        scanForPII(message),
        checkScope(message)
    ];
    for (const result of guards) {
        if (!result.pass) return result;
    }
    return { pass: true };
}
module.exports = {
    validateInput,
    detectPromptInjection,
    scanForPII,
    checkScope,
    checkLength
};