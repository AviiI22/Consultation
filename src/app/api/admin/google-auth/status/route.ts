import { NextResponse } from "next/server";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";

export async function GET() {
    return NextResponse.json({
        connected: await isGoogleCalendarConfigured(),
        hasCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    });
}
