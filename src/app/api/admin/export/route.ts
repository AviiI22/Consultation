import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
                        Name: b.name,
                        Email: b.email,
                        Phone: b.phone,
                        BirthDate: b.dob,
                        BirthTime: b.tob,
                        Gender: b.gender,
                        BirthPlace: b.birthPlace,
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
                Name: b.name,
                Email: b.email,
                Phone: b.phone,
                Amount: b.amount,
                Status: b.status,
                Payment: b.paymentStatus,
                PromoCode: b.promoCode || "",
                Discount: b.discountAmount,
                Timezone: (b as any).userTimezone,
                MeetingLink: b.meetingLink || "",
                Notes: b.adminNotes || "",
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
