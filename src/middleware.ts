import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ─── CSRF Protection ────────────────────────────────────────────────────
    // Verify Origin header on state-changing requests to prevent CSRF attacks.
    // Excludes NextAuth routes (they handle their own CSRF) and Vercel cron calls.
    const method = request.method;
    if (
        ["POST", "PATCH", "PUT", "DELETE"].includes(method) &&
        !pathname.startsWith("/api/auth") &&
        !pathname.startsWith("/api/cron")
    ) {
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");

        // Allow requests with no origin (same-origin form posts, server-to-server)
        // but block requests where origin doesn't match host
        if (origin && host) {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                return NextResponse.json(
                    { error: "CSRF validation failed" },
                    { status: 403 }
                );
            }
        }
    }

    // ─── Admin Route Protection ─────────────────────────────────────────────
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/:path*"],
};
