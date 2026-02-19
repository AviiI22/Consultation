import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (but not /admin/login)
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
    matcher: ["/admin/:path*"],
};
