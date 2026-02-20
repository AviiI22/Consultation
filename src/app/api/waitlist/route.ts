import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { date, name, email, phone } = await request.json();

        if (!date || !name || !email || !phone) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check if already on waitlist
        const existing = await prisma.waitlist.findFirst({
            where: { date, email },
        });
        if (existing) {
            return NextResponse.json(
                { error: "You are already on the waitlist for this date" },
                { status: 409 }
            );
        }

        const entry = await prisma.waitlist.create({
            data: { date, name, email, phone },
        });

        return NextResponse.json({ entry });
    } catch (error) {
        console.error("Waitlist error:", error);
        return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
    }
}
