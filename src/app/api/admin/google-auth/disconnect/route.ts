import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        // Delete the refresh token from the database
        await prisma.appSettings.deleteMany({
            where: { key: "GOOGLE_REFRESH_TOKEN" },
        });

        // Clear from process.env for the current invocation
        delete process.env.GOOGLE_REFRESH_TOKEN;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Google disconnect error:", error);
        return NextResponse.json(
            { error: "Failed to disconnect Google Calendar" },
            { status: 500 }
        );
    }
}
