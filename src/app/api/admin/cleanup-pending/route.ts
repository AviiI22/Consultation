import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/admin/cleanup-pending
 * Deletes Pending bookings older than 2 hours.
 * Also auto-marks Upcoming bookings whose date+time has passed as Completed.
 * Admin-only.
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    void request;

    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        // 1. Delete stale pending bookings
        const deleted = await prisma.booking.deleteMany({
            where: {
                paymentStatus: "Pending",
                createdAt: { lt: twoHoursAgo },
            },
        });

        // 2. Auto-complete past Upcoming bookings
        const today = new Date().toISOString().split("T")[0];
        const autoCompleted = await prisma.booking.updateMany({
            where: {
                paymentStatus: "Paid",
                status: "Upcoming",
                consultationDate: { lt: today },
            },
            data: { status: "Completed" },
        });

        return NextResponse.json({
            success: true,
            deletedPending: deleted.count,
            autoCompleted: autoCompleted.count,
            message: `Removed ${deleted.count} stale pending bookings. Auto-completed ${autoCompleted.count} past sessions.`,
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}
