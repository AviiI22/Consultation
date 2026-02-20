import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBulkAnnouncement } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { subject, message } = await request.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });
        }

        // Get all unique client emails
        const bookings = await prisma.booking.findMany({
            select: { email: true },
            distinct: ["email"],
        });

        const emails = bookings.map((b) => b.email);

        if (emails.length === 0) {
            return NextResponse.json({ message: "No recipients found." });
        }

        // Resend batch limit is usually 50 per email or use batching API
        // For simplicity, we send to all if small, or we could loop
        const result = await sendBulkAnnouncement(emails, subject, message);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ message: `Announcement sent to ${emails.length} clients.` });
    } catch (error) {
        console.error("Bulk announcement error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
