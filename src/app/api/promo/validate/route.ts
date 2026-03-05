import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!rateLimit(ip, 10, 60000)) {
        return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const promo = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!promo) {
            return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
        }

        if (!promo.isActive) {
            return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
        }

        if (promo.usedCount >= promo.maxUses) {
            return NextResponse.json({ error: "This promo code has been fully used" }, { status: 400 });
        }

        if (promo.expiresAt) {
            const today = new Date().toISOString().split("T")[0];
            if (promo.expiresAt < today) {
                return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
            }
        }

        return NextResponse.json({
            valid: true,
            code: promo.code,
            discountPercent: promo.discountPercent,
        });
    } catch (error) {
        console.error("Promo validation error:", error);
        return NextResponse.json({ error: "Failed to validate" }, { status: 500 });
    }
}
