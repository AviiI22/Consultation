import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export async function POST(request: NextRequest) {
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
                amount: parseInt(amount),
                paymentStatus: "Pending",
            },
        });

        // Create Razorpay order
        let razorpayOrderId = `order_demo_${booking.id.slice(0, 8)}`;
        try {
            const order = await razorpay.orders.create({
                amount: amount * 100, // Razorpay expects paise
                currency: "INR",
                receipt: booking.id,
            });
            razorpayOrderId = order.id;

            // Update booking with Razorpay order ID
            await prisma.booking.update({
                where: { id: booking.id },
                data: { razorpayOrderId: order.id },
            });
        } catch (rzpError) {
            console.log("Razorpay order creation skipped (test mode):", rzpError);
            // Still save the demo order ID
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
