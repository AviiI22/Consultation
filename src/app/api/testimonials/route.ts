import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — get approved testimonials
export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ testimonials });
    } catch (error) {
        console.error("Fetch testimonials error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

// Public — submit a testimonial (pending approval)
export async function POST(request: NextRequest) {
    try {
        const { name, rating, text } = await request.json();

        if (!name || !rating || !text) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                rating: Math.min(5, Math.max(1, parseInt(rating))),
                text,
                isApproved: false,
            },
        });

        return NextResponse.json({ testimonial });
    } catch (error) {
        console.error("Submit testimonial error:", error);
        return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }
}
