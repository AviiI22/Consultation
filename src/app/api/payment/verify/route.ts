import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";
import { sendEmailConfirmation } from "@/lib/email";
import { createConsultationEvent } from "@/lib/google-calendar";
import { parse, isValid } from "date-fns";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
        }

        // All three Razorpay fields are REQUIRED for payment verification
        if (!razorpay_signature || !razorpay_order_id || !razorpay_payment_id) {
            return NextResponse.json(
                { error: "Missing payment verification fields" },
                { status: 400 }
            );
        }

        // Verify Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not configured");
            return NextResponse.json(
                { error: "Payment verification is not configured" },
                { status: 500 }
            );
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Update booking status
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "Paid",
                razorpayPaymentId: razorpay_payment_id,
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
