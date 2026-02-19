import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";
import { sendEmailConfirmation } from "@/lib/email";

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
            },
            booking.phone
        ).then((result) => {
            if (result.success) {
                console.log(`WhatsApp sent for booking ${booking.id}`);
            } else {
                console.warn(`WhatsApp failed for booking ${booking.id}:`, result.error);
            }
        });

        // Send email confirmation (non-blocking)
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
        };
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
