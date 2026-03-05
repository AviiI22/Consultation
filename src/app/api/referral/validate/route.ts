import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const REFERRAL_DISCOUNT_PERCENT = 5; // Referrer gets 5% off their next booking

/**
 * GET /api/referral/validate?code=XYZ
 * Check if a referral code is valid and return the referrer's info.
 */
export async function GET(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 10, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const code = request.nextUrl.searchParams.get("code")?.toUpperCase().trim();
    if (!code) {
        return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    // Referral codes are in format: FIRSTNAME-XXXXX (derived from email/name)
    // For now, any booking in DB with matching referralCode as their generated code
    // The referral code for a user is: their name initials + last 5 chars of booking ID
    // Users share this code which is shown on the confirmation page
    const allBookings = await prisma.booking.findMany({
        where: { paymentStatus: "Paid" },
        select: { id: true, name: true, email: true },
    });

    const match = allBookings.find((b) => {
        const generatedCode = generateReferralCode(b.name, b.id);
        return generatedCode === code;
    });

    if (!match) {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    return NextResponse.json({
        valid: true,
        referrerName: match.name.split(" ")[0],
        discountPercent: REFERRAL_DISCOUNT_PERCENT,
        code,
    });
}

export function generateReferralCode(name: string, bookingId: string): string {
    const initials = name
        .split(" ")
        .map((w) => w[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 3);
    const suffix = bookingId.replace(/-/g, "").slice(0, 5).toUpperCase();
    return `${initials}${suffix}`;
}
