import { NextRequest, NextResponse } from "next/server";
import { sendSessionReminders } from "@/lib/reminders";

/**
 * POST /api/cron/reminders
 * Called by a Vercel Cron Job daily (see vercel.json) or manually.
 * Protected by CRON_SECRET environment variable.
 */
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, enforce it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const results = await sendSessionReminders();
        return NextResponse.json({
            success: true,
            total: results.total,
            sent: results.success,
            failed: results.failed,
            message: `Reminded ${results.success} of ${results.total} upcoming sessions.`,
        });
    } catch (error) {
        console.error("Cron reminders error:", error);
        return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
    }
}

// Also support GET for Vercel Cron (which uses GET by default)
export async function GET(request: NextRequest) {
    return POST(request);
}
