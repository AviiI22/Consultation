// ─── In-Memory Rate Limiter ─────────────────────────────────────────────────
// ⚠️  SERVERLESS LIMITATION: This rate limiter uses an in-memory Map, which
// resets on every cold-start in serverless environments like Vercel. It still
// provides protection against rapid bursts within a single instance's lifetime,
// but is NOT a reliable cross-request rate limiter.
//
// For production-grade rate limiting, consider:
//   1. Upstash Redis (@upstash/ratelimit) — serverless-friendly, ~$0.20/100k reqs
//   2. Vercel WAF / Firewall rules — no code changes needed
//   3. Database-backed limiter using the existing PostgreSQL connection
//
// The current implementation is kept as a best-effort defence layer.
// ────────────────────────────────────────────────────────────────────────────────

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
