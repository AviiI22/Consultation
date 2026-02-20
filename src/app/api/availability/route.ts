import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const slots = await prisma.availability.findMany({
            where: { isActive: true },
            orderBy: [{ dayOfWeek: "asc" }, { timeSlot: "asc" }],
        });

        const blockedDates = await prisma.blockedDate.findMany();

        return NextResponse.json({
            slots: slots.map((s) => ({
                dayOfWeek: s.dayOfWeek,
                timeSlot: s.timeSlot,
            })),
            blockedDates: blockedDates.map((d) => d.date),
        });
    } catch (error) {
        console.error("Public availability error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
