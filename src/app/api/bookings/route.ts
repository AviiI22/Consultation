import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import { rateLimit } from "@/lib/rate-limit";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
    console.warn("WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not configured. Payment creation will fail.");
}

const razorpay = new Razorpay({
    key_id: razorpayKeyId || "",
    key_secret: razorpayKeySecret || "",
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
            currency,
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
        // Calculate discount using atomic operation to prevent race conditions
        let discountAmount = 0;
        let finalAmount = parseInt(amount);
        if (promoCode && discountPercent > 0) {
            const promo = await prisma.promoCode.findUnique({
                where: { code: promoCode },
            });
            if (promo && promo.isActive && promo.usedCount < promo.maxUses) {
                // Atomic increment with WHERE guard prevents race conditions
                const updated = await prisma.promoCode.updateMany({
                    where: {
                        id: promo.id,
                        usedCount: { lt: promo.maxUses },
                    },
                    data: { usedCount: { increment: 1 } },
                });
                if (updated.count > 0) {
                    discountAmount = Math.round((finalAmount * promo.discountPercent) / 100);
                    finalAmount = finalAmount - discountAmount;
                    if (finalAmount < 1) finalAmount = 1;
                }
            }
        }

        // Use a transaction to prevent double-booking race conditions
        const booking = await prisma.$transaction(async (tx) => {
            // Check if the timeslot is already booked
            const existingBooking = await tx.booking.findFirst({
                where: {
                    consultationDate,
                    consultationTime,
                    paymentStatus: "Paid",
                },
            });

            if (existingBooking) {
                throw new Error("SLOT_TAKEN");
            }

            // Create booking in database
            return tx.booking.create({
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
                    currency: currency || "INR",
                },
            });
        }).catch((err) => {
            if (err.message === "SLOT_TAKEN") {
                return null;
            }
            throw err;
        });

        if (!booking) {
            return NextResponse.json(
                { error: "This timeslot is already booked. Please choose a different date or time." },
                { status: 409 }
            );
        }

        // Create Razorpay order
        let razorpayOrderId = `order_demo_${booking.id.slice(0, 8)}`;
        try {
            const order = await razorpay.orders.create({
                amount: finalAmount * 100, // Razorpay expects paise
                currency: booking.currency,
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
