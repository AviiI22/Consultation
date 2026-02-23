import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let pricing = await prisma.pricing.findUnique({
            where: { id: "singleton" },
            select: {
                id: true,
                inrNormal40: true,
                inrUrgent40: true,
                inrNormal90: true,
                inrUrgent90: true,
                inrBtr: true,
                updatedAt: true,
                inrNormal: true,
                inrUrgent: true,
                usdNormal: true,
                usdUrgent: true,
                usdBtr: true,
            },
        });

        if (!pricing) {
            pricing = await prisma.pricing.create({
                data: {
                    id: "singleton",
                    inrNormal40: 2499,
                    inrUrgent40: 4999,
                    inrNormal90: 4500,
                    inrUrgent90: 8000,
                    inrBtr: 2500,
                    inrNormal: 2499,
                    inrUrgent: 4999,
                    usdNormal: 30,
                    usdUrgent: 60,
                    usdBtr: 40,
                },
                select: {
                    id: true,
                    inrNormal40: true,
                    inrUrgent40: true,
                    inrNormal90: true,
                    inrUrgent90: true,
                    inrBtr: true,
                    updatedAt: true,
                    inrNormal: true,
                    inrUrgent: true,
                    usdNormal: true,
                    usdUrgent: true,
                    usdBtr: true,
                },
            });
        }

        return NextResponse.json({ pricing });
    } catch (error) {
        console.error("Fetch pricing error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await request.json();
        console.log("Admin pricing update request payload:", data);

        // Filter out undefined values to avoid Prisma issues
        const updateData: Record<string, number> = {};
        const fields = [
            'inrNormal40', 'inrUrgent40', 'inrNormal90', 'inrUrgent90', 'inrBtr',
            'inrNormal', 'inrUrgent', 'usdNormal', 'usdUrgent', 'usdBtr'
        ];

        fields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        const pricing = await prisma.pricing.update({
            where: { id: "singleton" },
            data: updateData,
        });

        return NextResponse.json({ pricing });
    } catch (error) {
        console.error("Update pricing error detail:", error);
        return NextResponse.json({ error: "Failed to update prices. Check server logs." }, { status: 500 });
    }
}
