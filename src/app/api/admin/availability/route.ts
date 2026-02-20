import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const slots = await prisma.availability.findMany({
            orderBy: [{ dayOfWeek: "asc" }, { timeSlot: "asc" }],
        });
        return NextResponse.json({ slots });
    } catch (error) {
        console.error("Fetch availability error:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { dayOfWeek, timeSlot } = await request.json();

        // Check duplicate
        const existing = await prisma.availability.findFirst({
            where: { dayOfWeek, timeSlot },
        });
        if (existing) {
            return NextResponse.json(
                { error: "This slot already exists" },
                { status: 409 }
            );
        }

        const slot = await prisma.availability.create({
            data: { dayOfWeek, timeSlot, isActive: true },
        });
        return NextResponse.json({ slot });
    } catch (error) {
        console.error("Create availability error:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        await prisma.availability.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete availability error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, isActive } = await request.json();
        const slot = await prisma.availability.update({
            where: { id },
            data: { isActive },
        });
        return NextResponse.json({ slot });
    } catch (error) {
        console.error("Toggle availability error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
