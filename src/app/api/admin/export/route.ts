import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sanitize strings to prevent CSV injection
function sanitizeCSV(value: string | null | undefined): string {
    if (!value) return "";
    // Prefix with single quote if starts with formula trigger characters
    if (/^[=+\-@\t\r]/.test(value)) {
        return `'${value}`;
    }
    return value;
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: "desc" },
        });

        let data: any[] = [];
        let filename = "export.csv";

        if (type === "clients") {
            const clientMap = new Map<string, any>();
            bookings.forEach((b) => {
                if (!clientMap.has(b.email)) {
                    clientMap.set(b.email, {
                        Name: sanitizeCSV(b.name),
                        Email: sanitizeCSV(b.email),
                        Phone: sanitizeCSV(b.phone),
                        BirthDate: sanitizeCSV(b.dob),
                        BirthTime: sanitizeCSV(b.tob),
                        Gender: sanitizeCSV(b.gender),
                        BirthPlace: sanitizeCSV(b.birthPlace),
                        TotalBookings: 1,
                        TotalSpent: b.paymentStatus === "Paid" ? b.amount : 0,
                    });
                } else {
                    const existing = clientMap.get(b.email);
                    existing.TotalBookings++;
                    if (b.paymentStatus === "Paid") existing.TotalSpent += b.amount;
                }
            });
            data = Array.from(clientMap.values());
            filename = `clients_${new Date().toISOString().split("T")[0]}.csv`;
        } else {
            data = bookings.map((b) => ({
                ID: b.id,
                Date: b.consultationDate,
                Time: b.consultationTime,
                Type: b.consultationType,
                Duration: b.duration,
                Name: sanitizeCSV(b.name),
                Email: sanitizeCSV(b.email),
                Phone: sanitizeCSV(b.phone),
                Amount: b.amount,
                Status: b.status,
                Payment: b.paymentStatus,
                PromoCode: sanitizeCSV(b.promoCode),
                Discount: b.discountAmount,
                Timezone: b.userTimezone || "UTC",
                MeetingLink: sanitizeCSV(b.meetingLink),
                Notes: sanitizeCSV(b.adminNotes),
                CreatedAt: b.createdAt.toISOString(),
            }));
            filename = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
        }

        const parser = new Parser();
        const csv = parser.parse(data);

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return new Response("Failed to generate export", { status: 500 });
    }
}
