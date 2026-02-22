import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { consultationDate: "asc" },
        });

        const today = new Date().toISOString().split("T")[0];
        const paid = bookings.filter((b) => b.paymentStatus === "Paid");

        // Overall stats
        const totalBookings = bookings.length;
        const totalRevenue = paid.reduce((sum, b) => sum + b.amount, 0);
        const totalDiscount = paid.reduce((sum, b) => sum + b.discountAmount, 0);
        const upcomingCount = bookings.filter((b) => b.consultationDate >= today && b.status === "Upcoming").length;
        const completedCount = bookings.filter((b) => b.status === "Completed").length;
        const cancelledCount = bookings.filter((b) => b.status === "Cancelled").length;

        // Unique clients
        const uniqueEmails = new Set(bookings.map((b) => b.email));
        const uniqueClients = uniqueEmails.size;
        const repeatClients = [...uniqueEmails].filter(
            (email) => bookings.filter((b) => b.email === email).length > 1
        ).length;

        // Revenue by month (last 6 months)
        const revenueByMonth: Record<string, number> = {};
        const bookingsByMonth: Record<string, number> = {};
        for (const b of paid) {
            const month = b.consultationDate.slice(0, 7); // "2026-02"
            revenueByMonth[month] = (revenueByMonth[month] || 0) + b.amount;
            bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
        }

        // Popular time slots
        const timeSlotCounts: Record<string, number> = {};
        for (const b of paid) {
            timeSlotCounts[b.consultationTime] = (timeSlotCounts[b.consultationTime] || 0) + 1;
        }

        // Consultation type distribution
        const typeCounts: Record<string, number> = {};
        for (const b of bookings) {
            const label = b.consultationType === "urgent" ? "Urgent" : "Normal";
            typeCounts[label] = (typeCounts[label] || 0) + 1;
        }

        // Duration distribution
        const durationCounts: Record<string, number> = {};
        for (const b of bookings) {
            const label = b.duration === 90 ? "1 Hour 30 Min" : "40 Min";
            durationCounts[label] = (durationCounts[label] || 0) + 1;
        }

        // Day of week distribution
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeekCounts: Record<string, number> = {};
        for (const b of paid) {
            const day = new Date(b.consultationDate).getDay();
            const label = dayNames[day];
            dayOfWeekCounts[label] = (dayOfWeekCounts[label] || 0) + 1;
        }

        return NextResponse.json({
            stats: {
                totalBookings,
                totalRevenue,
                totalDiscount,
                upcomingCount,
                completedCount,
                cancelledCount,
                uniqueClients,
                repeatClients,
            },
            charts: {
                revenueByMonth,
                bookingsByMonth,
                timeSlotCounts,
                typeCounts,
                durationCounts,
                dayOfWeekCounts,
            },
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
