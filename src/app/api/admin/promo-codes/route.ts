import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const codes = await prisma.promoCode.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ codes });
    } catch (error) {
        console.error("Fetch promo codes error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { code, discountPercent, maxUses, expiresAt } = await request.json();

        const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return NextResponse.json({ error: "Code already exists" }, { status: 409 });
        }

        const promo = await prisma.promoCode.create({
            data: {
                code: code.toUpperCase(),
                discountPercent: parseInt(discountPercent),
                maxUses: parseInt(maxUses) || 1,
                expiresAt: expiresAt || null,
            },
        });
        return NextResponse.json({ promo });
    } catch (error) {
        console.error("Create promo error:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, isActive } = await request.json();
        const promo = await prisma.promoCode.update({
            where: { id },
            data: { isActive },
        });
        return NextResponse.json({ promo });
    } catch (error) {
        console.error("Toggle promo error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        await prisma.promoCode.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete promo error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
