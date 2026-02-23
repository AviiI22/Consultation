import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const packages = await prisma.servicePackage.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ packages });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { name, description, sessionCount, price } = body;

        const pkg = await prisma.servicePackage.create({
            data: {
                name,
                description,
                sessionCount: Number(sessionCount),
                price: Number(price),
            },
        });

        return NextResponse.json(pkg);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
