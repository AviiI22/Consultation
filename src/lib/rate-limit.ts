// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = rateMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateMap.set(ip, { count: 1, resetAt: now + windowMs });
        return true; // allowed
    }

    if (entry.count >= maxRequests) {
        return false; // rate limited
    }

    entry.count++;
    return true; // allowed
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateMap.entries()) {
        if (now > value.resetAt) {
            rateMap.delete(key);
        }
    }
}, 5 * 60 * 1000);
