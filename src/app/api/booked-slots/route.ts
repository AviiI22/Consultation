import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const today = new Date().toISOString().split("T")[0];
        const bookings = await prisma.booking.findMany({
            where: {
                paymentStatus: "Paid",
                consultationDate: { gte: today },
            },
            select: {
                consultationDate: true,
                consultationTime: true,
            },
        });

        const bookedSlots = bookings.map((b) => ({
            date: b.consultationDate,
            time: b.consultationTime,
        }));

        return NextResponse.json({ bookedSlots });
    } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        return NextResponse.json(
            { error: "Failed to fetch booked slots" },
            { status: 500 }
        );
    }
}
