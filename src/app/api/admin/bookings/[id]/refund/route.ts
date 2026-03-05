import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * PATCH /api/admin/bookings/[id]/refund
 * Admin updates refund status for a cancelled booking.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { refundStatus, refundAmount } = await request.json();

    if (!["Pending", "Issued", "N/A"].includes(refundStatus)) {
        return NextResponse.json({ error: "Invalid refund status" }, { status: 400 });
    }

    try {
        const booking = await prisma.booking.update({
            where: { id: params.id },
            data: {
                refundStatus,
                ...(refundAmount !== undefined ? { refundAmount: parseInt(refundAmount) } : {}),
            } as Parameters<typeof prisma.booking.update>[0]["data"],
        });

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error("Refund update error:", error);
        return NextResponse.json({ error: "Failed to update refund" }, { status: 500 });
    }
}
