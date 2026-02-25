import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";
import { sendEmailConfirmation } from "@/lib/email";
import { createConsultationEvent } from "@/lib/google-calendar";
import { parse, isValid } from "date-fns";

const cashfreeAppId = process.env.CASHFREE_APP_ID;
const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = "https://api.cashfree.com/pg/orders";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, orderId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
        }

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing order ID for payment verification" },
                { status: 400 }
            );
        }

        // Verify payment by fetching order status from Cashfree
        if (!cashfreeAppId || !cashfreeSecretKey) {
            console.error("CASHFREE_APP_ID or CASHFREE_SECRET_KEY is not configured");
            return NextResponse.json(
                { error: "Payment verification is not configured" },
                { status: 500 }
            );
        }

        const cfResponse = await fetch(`${CASHFREE_API_URL}/${orderId}`, {
            method: "GET",
            headers: {
                "x-client-id": cashfreeAppId,
                "x-client-secret": cashfreeSecretKey,
                "x-api-version": "2023-08-01",
            },
        });

        const cfData = await cfResponse.json();

        if (!cfResponse.ok || cfData.order_status !== "PAID") {
            return NextResponse.json(
                { error: "Payment not completed. Order status: " + (cfData.order_status || "unknown") },
                { status: 400 }
            );
        }

        // Update booking status
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "Paid",
                cashfreePaymentId: cfData.cf_order_id?.toString() || orderId,
            },
        });

        // Send WhatsApp confirmation (non-blocking)
        sendWhatsAppConfirmation(
            {
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
            },
            booking.phone
        ).then((result) => {
            if (result.success) {
                console.log(`WhatsApp sent for booking ${booking.id}`);
            } else {
                console.warn(`WhatsApp failed for booking ${booking.id}:`, result.error);
            }
        });

        // Prepare data for email/notifications
        const emailBookingData = {
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
            meetingLink: booking.meetingLink,
            userTimezone: booking.userTimezone || "UTC",
        };

        // Create Google Calendar Event (non-blocking — fire and forget)
        const timePart = booking.consultationTime.split(" - ")[0];
        const fullDateStr = `${booking.consultationDate} ${timePart}`;
        const dateObj = parse(fullDateStr, "yyyy-MM-dd h:mm a", new Date());

        if (isValid(dateObj)) {
            createConsultationEvent({
                summary: `Astrology Consultation: ${booking.name}`,
                description: `Consultation Type: ${booking.consultationType}\nBTR Option: ${booking.btrOption}\nDuration: ${booking.duration} mins\nConcern: ${booking.concern}`,
                startTime: dateObj,
                durationMinutes: booking.duration,
                attendeeEmail: booking.email,
                timezone: booking.userTimezone || "UTC",
            }).then(async (event) => {
                if (event && event.hangoutLink) {
                    console.log(`Calendar event created: ${event.hangoutLink}`);
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { meetingLink: event.hangoutLink },
                    });
                }
            }).catch((err) => {
                console.error("Failed to create calendar event:", err);
            });
        }

        // Send email confirmation (non-blocking)
        sendEmailConfirmation(emailBookingData).then((result) => {
            if (result.success) {
                console.log(`Email sent for booking ${booking.id}`);
            } else {
                console.warn(`Email failed for booking ${booking.id}:`, result.error);
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        );
    }
}
