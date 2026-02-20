import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { rateLimit } from "@/lib/rate-limit";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export async function POST(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!rateLimit(ip, 5, 60000)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();

        const {
            consultationType,
            btrOption,
            duration,
            consultationDate,
            consultationTime,
            name,
            dob,
            tob,
            gender,
            email,
            phone,
            birthPlace,
            concern,
            amount,
            promoCode,
            discountPercent,
            userTimezone,
        } = body;

        // Validate required fields
        if (!consultationType || !btrOption || !duration || !consultationDate || !consultationTime) {
            return NextResponse.json(
                { error: "Missing consultation details" },
                { status: 400 }
            );
        }

        if (!name || !dob || !tob || !gender || !email || !phone || !birthPlace || !concern) {
            return NextResponse.json(
                { error: "Missing personal details" },
                { status: 400 }
            );
        }

        // Check if the timeslot is already booked
        const existingBooking = await prisma.booking.findFirst({
            where: {
                consultationDate,
                consultationTime,
                paymentStatus: "Paid",
            },
        });

        if (existingBooking) {
            return NextResponse.json(
                { error: "This timeslot is already booked. Please choose a different date or time." },
                { status: 409 }
            );
        }

        // Calculate discount
        let discountAmount = 0;
        let finalAmount = parseInt(amount);
        if (promoCode && discountPercent > 0) {
            // Verify the promo code server-side
            const promo = await prisma.promoCode.findUnique({
                where: { code: promoCode },
            });
            if (promo && promo.isActive && promo.usedCount < promo.maxUses) {
                discountAmount = Math.round((finalAmount * promo.discountPercent) / 100);
                finalAmount = finalAmount - discountAmount;
                if (finalAmount < 1) finalAmount = 1; // minimum ₹1

                // Increment usage
                await prisma.promoCode.update({
                    where: { id: promo.id },
                    data: { usedCount: promo.usedCount + 1 },
                });
            }
        }

        // Create booking in database
        const booking = await prisma.booking.create({
            data: {
                consultationType,
                btrOption,
                duration: parseInt(duration),
                consultationDate,
                consultationTime,
                name,
                dob,
                tob,
                gender,
                email,
                phone,
                birthPlace,
                concern,
                amount: finalAmount,
                discountAmount,
                promoCode: promoCode || null,
                paymentStatus: "Pending",
                status: "Upcoming",
                userTimezone: userTimezone || "UTC",
            },
        });

        // Create Razorpay order
        let razorpayOrderId = `order_demo_${booking.id.slice(0, 8)}`;
        try {
            const order = await razorpay.orders.create({
                amount: finalAmount * 100, // Razorpay expects paise
                currency: "INR",
                receipt: booking.id,
            });
            razorpayOrderId = order.id;

            await prisma.booking.update({
                where: { id: booking.id },
                data: { razorpayOrderId: order.id },
            });
        } catch (rzpError) {
            console.log("Razorpay order creation skipped (test mode):", rzpError);
            await prisma.booking.update({
                where: { id: booking.id },
                data: { razorpayOrderId },
            });
        }

        return NextResponse.json({
            id: booking.id,
            amount: booking.amount,
            razorpayOrderId,
        });
    } catch (error) {
        console.error("Booking creation error:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
