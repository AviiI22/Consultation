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
        const dates = await prisma.blockedDate.findMany({
            orderBy: { date: "asc" },
        });
        return NextResponse.json({ dates });
    } catch (error) {
        console.error("Fetch blocked dates error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { date, reason } = await request.json();

        const existing = await prisma.blockedDate.findUnique({ where: { date } });
        if (existing) {
            return NextResponse.json(
                { error: "This date is already blocked" },
                { status: 409 }
            );
        }

        const blocked = await prisma.blockedDate.create({
            data: { date, reason },
        });
        return NextResponse.json({ blocked });
    } catch (error) {
        console.error("Block date error:", error);
        return NextResponse.json({ error: "Failed to block date" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        await prisma.blockedDate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unblock date error:", error);
        return NextResponse.json({ error: "Failed to unblock" }, { status: 500 });
    }
}
