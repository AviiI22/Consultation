import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createConsultationEvent, parseBookingDateTime } from "@/lib/google-calendar";
import { sendEmailConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, notifyClient } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (booking.paymentStatus !== "Paid") {
            return NextResponse.json(
                { error: "Cannot create a meeting for an unpaid booking" },
                { status: 400 }
            );
        }

        const dateObj = parseBookingDateTime(
            booking.consultationDate,
            booking.consultationTime
        );

        if (!dateObj) {
            return NextResponse.json(
                { error: "Could not parse booking date/time" },
                { status: 400 }
            );
        }

        const event = await createConsultationEvent({
            summary: `Astrology Consultation: ${booking.name}`,
            description: [
                `Client: ${booking.name}`,
                `Type: ${booking.consultationType} | BTR: ${booking.btrOption}`,
                `Duration: ${booking.duration} mins`,
                `Concern: ${booking.concern}`,
                `DOB: ${booking.dob} | TOB: ${booking.tob}`,
                `Birth Place: ${booking.birthPlace}`,
                `Email: ${booking.email} | Phone: ${booking.phone}`,
            ].join("\n"),
            startTime: dateObj,
            durationMinutes: booking.duration,
            attendeeEmail: booking.email,
            timezone: booking.userTimezone || "Asia/Kolkata",
        });

        if (!event?.hangoutLink) {
            return NextResponse.json(
                {
                    error: "Google Meet could not be created. Make sure Google Calendar is connected in the Admin Dashboard.",
                },
                { status: 500 }
            );
        }

        const meetingLink = event.hangoutLink;

        // Save meeting link to database
        await prisma.booking.update({
            where: { id: bookingId },
            data: { meetingLink },
        });

        // Optionally notify the client via email with the new/updated link
        if (notifyClient) {
            sendEmailConfirmation({
                bookingId: booking.id,
                name: booking.name,
                consultationType: booking.consultationType,
                btrOption: booking.btrOption,
                duration: booking.duration,
                consultationDate: booking.consultationDate,
                consultationTime: booking.consultationTime,
                dob: booking.dob,
                tob: booking.tob,
                gender: booking.gender,
                email: booking.email,
                phone: booking.phone,
                birthPlace: booking.birthPlace,
                concern: booking.concern,
                amount: booking.amount,
                currency: booking.currency || "INR",
                meetingLink,
                userTimezone: booking.userTimezone || "Asia/Kolkata",
            }).then((r) => {
                if (!r.success) console.warn("Email notify failed:", r.error);
            });
        }

        return NextResponse.json({ success: true, meetingLink });
    } catch (error) {
        console.error("Generate Meet API error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate meeting link",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
