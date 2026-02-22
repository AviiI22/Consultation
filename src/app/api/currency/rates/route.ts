import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Fetching rates with INR as the base currency
        const response = await fetch("https://open.er-api.com/v6/latest/INR");
        const data = await response.json();

        if (data && data.result === "success") {
            return NextResponse.json({
                base: "INR",
                rates: data.rates,
                time_last_update_utc: data.time_last_update_utc
            });
        }

        throw new Error("Failed to fetch rates from provider");
    } catch (error) {
        console.error("Currency rates fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 });
    }
}
