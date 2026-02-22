import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const pricing = await prisma.pricing.findUnique({
            where: { id: "singleton" },
            select: {
                inrNormal40: true,
                inrUrgent40: true,
                inrNormal90: true,
                inrUrgent90: true,
                inrBtr: true,
                // Legacy support
                inrNormal: true,
                inrUrgent: true,
                usdNormal: true,
                usdUrgent: true,
                usdBtr: true,
            },
        });

        const defaultPricing = {
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
        };

        return NextResponse.json({
            pricing: pricing || defaultPricing
        });
    } catch (error) {
        console.error("Fetch pricing error:", error);
        return NextResponse.json({
            pricing: {
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
            }
        });
    }
}
