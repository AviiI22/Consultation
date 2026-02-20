import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Admin — get all testimonials (including unapproved)
export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ testimonials });
    } catch (error) {
        console.error("Admin fetch testimonials error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

// Admin — approve/reject
export async function PATCH(request: NextRequest) {
    try {
        const { id, isApproved } = await request.json();
        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: { isApproved },
        });
        return NextResponse.json({ testimonial });
    } catch (error) {
        console.error("Update testimonial error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

// Admin — delete
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        await prisma.testimonial.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete testimonial error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
