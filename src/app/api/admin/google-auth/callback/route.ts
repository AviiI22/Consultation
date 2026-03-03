import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

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
            // If no refresh token, maybe they already authorized before. Direct them to re-authorize.
            return NextResponse.redirect(
                new URL("/admin?google_auth=error&reason=no_refresh_token", request.url)
            );
        }

        // Write the refresh token to .env file
        const envPath = path.join(process.cwd(), ".env");
        let envContent = fs.readFileSync(envPath, "utf-8");

        if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
            // Replace existing value
            envContent = envContent.replace(
                /GOOGLE_REFRESH_TOKEN=.*/,
                `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
            );
        } else {
            // Append it
            envContent += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
        }

        fs.writeFileSync(envPath, envContent, "utf-8");

        // Also set it in the current process so it works immediately without restart
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
