import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ─── Brute-force protection ────────────────────────────────────────────────────
// In-memory tracker for failed login attempts.
// NOTE: On Vercel serverless this resets per cold-start, but it still limits
// rapid automated attacks within a single instance's lifetime.
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(ip: string): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (entry && now < entry.lockedUntil) {
        return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
    }

    // Reset if lockout expired
    if (entry && now >= entry.lockedUntil) {
        loginAttempts.delete(ip);
    }

    return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
    const entry = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    entry.count += 1;

    if (entry.count >= MAX_ATTEMPTS) {
        entry.lockedUntil = Date.now() + LOCKOUT_MS;
        console.warn(`🔒 Admin login locked for IP ${ip} after ${MAX_ATTEMPTS} failed attempts`);
    }

    loginAttempts.set(ip, entry);
}

function clearAttempts(ip: string): void {
    loginAttempts.delete(ip);
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of loginAttempts.entries()) {
        if (now >= entry.lockedUntil && entry.lockedUntil > 0) {
            loginAttempts.delete(ip);
        }
    }
}, 30 * 60 * 1000);

// ─── NextAuth config ───────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                // Extract IP for brute-force tracking
                const forwarded = req?.headers?.["x-forwarded-for"];
                const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : forwarded?.[0]) || "unknown";

                // Check brute-force lockout
                const check = checkBruteForce(ip);
                if (!check.allowed) {
                    throw new Error(`Too many login attempts. Please try again in ${check.retryAfterSec} seconds.`);
                }

                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (
                    credentials?.email === adminEmail &&
                    credentials?.password === adminPassword
                ) {
                    clearAttempts(ip);
                    return {
                        id: "admin",
                        name: "Admin",
                        email: adminEmail,
                    };
                }

                recordFailedAttempt(ip);
                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/admin/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
