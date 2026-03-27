import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailConfirmation, sendAdminNotification } from "@/lib/email";
import { createConsultationEvent, parseBookingDateTime } from "@/lib/google-calendar";

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

        // ─── Step 1: Verify payment with Cashfree ─────────────────────────
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

        // ─── Step 2: Update booking to Paid ───────────────────────────────
        let booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "Paid",
                cashfreePaymentId: cfData.cf_order_id?.toString() || orderId,
            },
        });

        // ─── Step 3: Create Google Meet Event (synchronous, before email) ──
        let meetingLink = booking.meetingLink;

        if (!meetingLink) {
            // Returns a local datetime string like "2026-03-10T19:00:00" (no Z).
            // Google Calendar interprets it in the `timezone` field — so the
            // meeting is created at exactly the slot the user chose.
            const localDateTimeStr = parseBookingDateTime(
                booking.consultationDate,
                booking.consultationTime
            );

            if (localDateTimeStr) {
                try {
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
                        startTime: localDateTimeStr,
                        durationMinutes: booking.duration,
                        attendeeEmail: booking.email,
                        timezone: booking.userTimezone || "Asia/Kolkata",
                    });

                    if (event?.hangoutLink) {
                        meetingLink = event.hangoutLink;
                        booking = await prisma.booking.update({
                            where: { id: booking.id },
                            data: { meetingLink },
                        });
                        console.log(`✅ Google Meet created: ${meetingLink}`);
                    }
                } catch (meetErr) {
                    console.error("⚠️ Failed to create Google Meet (non-fatal):", meetErr);
                }
            }
        }

        // ─── Step 4: Send Email Confirmation (with meeting link) ──────────
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
            meetingLink: meetingLink || null,
            userTimezone: booking.userTimezone || "Asia/Kolkata",
        }).then((result) => {
            if (result.success) {
                console.log(`✅ Email sent for booking ${booking.id}`);
            } else {
                console.warn(`⚠️ Email failed for booking ${booking.id}:`, result.error);
            }
        });

        // Notify admin of new paid booking
        sendAdminNotification({
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
            meetingLink: meetingLink || null,
            userTimezone: booking.userTimezone || "Asia/Kolkata",
        }).catch((err) => {
            console.warn("Admin notification failed (non-fatal):", err);
        });

        return NextResponse.json({
            success: true,
            meetingLink: meetingLink || null,
            bookingId: booking.id,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        );
    }
}
