import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(
            new URL(`/admin?google_auth=error&reason=${encodeURIComponent(error)}`, request.url)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL("/admin?google_auth=error&reason=no_code", request.url)
        );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return NextResponse.redirect(
            new URL("/admin?google_auth=error&reason=missing_credentials", request.url)
        );
    }

    try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            // If no refresh token, the user has already authorized before.
            // They must revoke access at myaccount.google.com/permissions and re-authorize.
            return NextResponse.redirect(
                new URL("/admin?google_auth=error&reason=no_refresh_token", request.url)
            );
        }

        // Persist the refresh token in the database so it survives across
        // serverless function invocations (Vercel's filesystem is ephemeral).
        await prisma.appSettings.upsert({
            where: { key: "GOOGLE_REFRESH_TOKEN" },
            update: { value: tokens.refresh_token },
            create: { key: "GOOGLE_REFRESH_TOKEN", value: tokens.refresh_token },
        });

        // Also cache in process.env for the lifetime of this invocation
        process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;

        return NextResponse.redirect(
            new URL("/admin?google_auth=success", request.url)
        );
    } catch (err) {
        console.error("Google OAuth callback error:", err);
        return NextResponse.redirect(
            new URL("/admin?google_auth=error&reason=token_exchange_failed", request.url)
        );
    }
}
