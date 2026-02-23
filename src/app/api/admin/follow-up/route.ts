import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendFollowUpEmail } from "@/lib/followup";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { bookingId } = await request.json();

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const result = await sendFollowUpEmail({
            name: booking.name,
            email: booking.email,
            consultationDate: booking.consultationDate,
            consultationTime: booking.consultationTime,
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }
    } catch (error) {
        console.error("Follow-up send error:", error);
        return NextResponse.json({ error: "Failed to send follow-up" }, { status: 500 });
    }
}
