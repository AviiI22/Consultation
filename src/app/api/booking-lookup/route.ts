import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/booking-lookup?bookingId=xxx&email=yyy
 * Public endpoint — lets users look up their own booking by ID + email.
 */
export async function GET(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 10, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!bookingId || !email) {
        return NextResponse.json({ error: "Booking ID and email are required" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, email: { equals: email, mode: "insensitive" } },
        select: {
            id: true,
            consultationType: true,
            btrOption: true,
            duration: true,
            consultationDate: true,
            consultationTime: true,
            name: true,
            email: true,
            phone: true,
            amount: true,
            currency: true,
            paymentStatus: true,
            status: true,
            meetingLink: true,
            userTimezone: true,
            createdAt: true,
        },
    });

    if (!booking) {
        return NextResponse.json({ error: "Booking not found. Check your Booking ID and email." }, { status: 404 });
    }

    return NextResponse.json({ booking });
}

/**
 * POST /api/booking-lookup
 * Cancel a booking (self-service). Only allowed if > 24h before session.
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 5, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { bookingId, email, action } = await request.json();

    if (!bookingId || !email || action !== "cancel") {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, email: { equals: email, mode: "insensitive" } },
    });

    if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "Upcoming" || booking.paymentStatus !== "Paid") {
        return NextResponse.json({ error: "Only upcoming paid bookings can be cancelled" }, { status: 400 });
    }

    // Enforce 24h cancellation policy
    const now = new Date();
    const sessionDateStr = booking.consultationDate;
    const timePart = booking.consultationTime.split(" - ")[0].trim();
    const match = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === "AM" && h === 12) h = 0;
        if (period === "PM" && h !== 12) h += 12;
        const sessionDate = new Date(`${sessionDateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
        const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / 3600000;

        if (hoursUntilSession < 24) {
            return NextResponse.json({
                error: "Cancellations must be made at least 24 hours before the session.",
            }, { status: 400 });
        }
    }

    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "Cancelled",
            refundStatus: "Pending",
        } as Parameters<typeof prisma.booking.update>[0]["data"],
    });

    return NextResponse.json({ success: true, message: "Booking cancelled. Refund will be processed within 5-7 business days." });
}
