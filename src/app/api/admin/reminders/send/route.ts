import { NextRequest, NextResponse } from "next/server";
import { sendSessionReminders } from "@/lib/reminders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    // Protect with auth
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const results = await sendSessionReminders();
        return NextResponse.json({
            message: `Reminder cycle completed.`,
            results,
        });
    } catch (error) {
        console.error("Reminder execution error:", error);
        return NextResponse.json(
            { error: "Failed to execute reminders" },
            { status: 500 }
        );
    }
}
