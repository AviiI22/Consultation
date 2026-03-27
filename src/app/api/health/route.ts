import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Health check endpoint — verifies database connectivity.
 * Use for uptime monitoring, deployment checks, etc.
 */
export async function GET() {
    try {
        // Verify database is reachable with a lightweight query
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected",
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json(
            {
                status: "error",
                timestamp: new Date().toISOString(),
                database: "disconnected",
            },
            { status: 503 }
        );
    }
}
