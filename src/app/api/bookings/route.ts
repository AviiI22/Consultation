import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const cashfreeAppId = process.env.CASHFREE_APP_ID;
const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = "https://api.cashfree.com/pg/orders";

if (!cashfreeAppId || !cashfreeSecretKey) {
    console.warn("WARNING: CASHFREE_APP_ID or CASHFREE_SECRET_KEY not configured. Payment creation will fail.");
}

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

        // Create Cashfree order
        let cashfreeOrderId = booking.id;
        let paymentSessionId = "";

        try {
            const customerPhone = phone.replace(/[^0-9]/g, "");
            const formattedPhone = customerPhone.length >= 10 ? customerPhone.slice(-10) : customerPhone.padStart(10, '0');

            const cfResponse = await fetch(CASHFREE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-client-id": cashfreeAppId || "",
                    "x-client-secret": cashfreeSecretKey || "",
                    "x-api-version": "2023-08-01",
                },
                body: JSON.stringify({
                    order_id: booking.id,
                    order_amount: finalAmount,
                    order_currency: booking.currency,
                    customer_details: {
                        customer_id: booking.id,
                        customer_name: name,
                        customer_email: email,
                        customer_phone: formattedPhone,
                    },
                    order_meta: {
                        return_url: `${(request.headers.get("origin") || "https://localhost:3000").replace("http://", "https://")}/payment?order_id={order_id}`,
                    },
                }),
            });

            const cfData = await cfResponse.json();

            if (cfResponse.ok && cfData.payment_session_id) {
                cashfreeOrderId = cfData.order_id || booking.id;
                paymentSessionId = cfData.payment_session_id;

                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { cashfreeOrderId },
                });
            } else {
                console.error("Cashfree order creation failed:", cfData);
                throw new Error(cfData.message || "Cashfree order creation failed");
            }
        } catch (cfError) {
            console.error("Cashfree order creation error:", cfError);
            throw cfError; // Re-throw to be caught by outer catch and return 500
        }

        return NextResponse.json({
            id: booking.id,
            amount: booking.amount,
            cashfreeOrderId,
            paymentSessionId,
        });
    } catch (error) {
        console.error("Booking creation error:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "no stack");
        return NextResponse.json(
            { error: "Failed to create booking", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
