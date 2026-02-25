import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function trigger() {
    try {
        const lastBooking = await prisma.booking.findFirst({
            where: { email: "deathnote2295@gmail.com" },
            orderBy: { createdAt: "desc" },
        });

        if (!lastBooking) {
            console.error("No booking found for deathnote2295@gmail.com");
            return;
        }

        console.log(`Found booking ${lastBooking.id}. Current status: ${lastBooking.paymentStatus}`);

        if (lastBooking.paymentStatus === "Paid") {
            console.log("Booking is already marked as Paid. Attempting to re-verify to trigger notifications...");
        }

        const res = await fetch("http://localhost:3000/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bookingId: lastBooking.id,
                // Skipping Cashfree order ID will skip verification check in the API
            }),
        });

        const result = await res.json();
        console.log("Verification response:", result);

        if (res.ok) {
            console.log("Notification trigger successful! Check your email and WhatsApp.");
        } else {
            console.error("Failed to trigger notification:", result.error);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

trigger();
