import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const diagnostics: Record<string, unknown> = {};

    // 1. Check env vars
    diagnostics.hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    diagnostics.hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    diagnostics.redirectUri = process.env.GOOGLE_REDIRECT_URI || "NOT SET";
    diagnostics.hasHostEmail = !!process.env.GOOGLE_HOST_EMAIL;

    // 2. Check refresh token
    let refreshToken: string | null = process.env.GOOGLE_REFRESH_TOKEN || null;
    if (!refreshToken) {
        try {
            const row = await prisma.appSettings.findUnique({
                where: { key: "GOOGLE_REFRESH_TOKEN" },
            });
            refreshToken = row?.value ?? null;
            diagnostics.refreshTokenSource = row ? "database" : "not_found";
        } catch (e) {
            diagnostics.refreshTokenSource = "db_error";
            diagnostics.dbError = e instanceof Error ? e.message : String(e);
        }
    } else {
        diagnostics.refreshTokenSource = "env_var";
    }
    diagnostics.hasRefreshToken = !!refreshToken;

    // 3. Try to get an access token (this tests if the refresh token is valid)
    if (refreshToken && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        try {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );
            oauth2Client.setCredentials({ refresh_token: refreshToken });
            const { token } = await oauth2Client.getAccessToken();
            diagnostics.accessTokenObtained = !!token;
        } catch (e) {
            diagnostics.accessTokenObtained = false;
            diagnostics.accessTokenError = e instanceof Error ? e.message : String(e);
        }
    }

    // 4. Try listing calendars (tests if Calendar API is enabled)
    if (diagnostics.accessTokenObtained) {
        try {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );
            oauth2Client.setCredentials({ refresh_token: refreshToken! });
            const calendar = google.calendar({ version: "v3", auth: oauth2Client });
            const calList = await calendar.calendarList.list({ maxResults: 1 });
            diagnostics.calendarApiEnabled = true;
            diagnostics.calendarCount = calList.data.items?.length ?? 0;
        } catch (e) {
            diagnostics.calendarApiEnabled = false;
            diagnostics.calendarApiError = e instanceof Error ? e.message : String(e);
        }
    }

    return NextResponse.json(diagnostics);
}
