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

        // Verify Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

        if (razorpay_signature && razorpay_order_id && razorpay_payment_id) {
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
        }

        // Update booking status
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: "Paid",
                razorpayPaymentId: razorpay_payment_id || "demo_payment",
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
                currency: (booking as any).currency || "INR",
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
            currency: (booking as any).currency || "INR",
            meetingLink: (booking as any).meetingLink,
            userTimezone: (booking as any).userTimezone || "UTC",
        };

        // 3. Create Google Calendar Event (non-blocking but we'll try to get the link for email if possible)
        // Note: For better UX, we could make this blocking if we want the email to definitely have the link,
        // but let's keep it non-blocking and just re-send or handle gracefully.

        // Fix date parsing: consultationDate is "yyyy-MM-dd", consultationTime is "10:00 AM - 11:00 AM" (example)
        const timePart = booking.consultationTime.split(" - ")[0]; // "10:00 AM"
        const fullDateStr = `${booking.consultationDate} ${timePart}`; // "2026-02-25 10:00 AM"
        const dateObj = parse(fullDateStr, "yyyy-MM-dd h:mm a", new Date());

        if (isValid(dateObj)) {
            try {
                const event = await createConsultationEvent({
                    summary: `Astrology Consultation: ${booking.name}`,
                    description: `Consultation Type: ${booking.consultationType}\nBTR Option: ${booking.btrOption}\nDuration: ${booking.duration} mins\nConcern: ${booking.concern}`,
                    startTime: dateObj,
                    durationMinutes: booking.duration,
                    attendeeEmail: booking.email,
                    timezone: (booking as any).userTimezone || "UTC",
                });

                if (event && event.hangoutLink) {
                    console.log(`Calendar event created: ${event.hangoutLink}`);
                    // Save the meeting link to the booking
                    await prisma.booking.update({
                        where: { id: booking.id },
                        data: { meetingLink: event.hangoutLink },
                    });
                    // Attach to our data object for email/whatsapp if we want
                    (emailBookingData as any).meetingLink = event.hangoutLink;
                }
            } catch (err) {
                console.error("Failed to create calendar event:", err);
            }
        }

        // Now send email confirmation (it might have the meeting link now)
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
