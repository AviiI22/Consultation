import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input");

    if (!input || input.length < 3) {
        return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey || apiKey === "placeholder_key") {
        // Fallback: return some common Indian cities for demo
        const fallbackCities = [
            "Mumbai, Maharashtra, India",
            "Delhi, India",
            "Bangalore, Karnataka, India",
            "Hyderabad, Telangana, India",
            "Chennai, Tamil Nadu, India",
            "Kolkata, West Bengal, India",
            "Pune, Maharashtra, India",
            "Jaipur, Rajasthan, India",
            "Ahmedabad, Gujarat, India",
            "Lucknow, Uttar Pradesh, India",
            "Chandigarh, India",
            "Bhopal, Madhya Pradesh, India",
            "Patna, Bihar, India",
            "Thiruvananthapuram, Kerala, India",
            "Guwahati, Assam, India",
        ].filter((city) => city.toLowerCase().includes(input.toLowerCase()));

        return NextResponse.json({
            predictions: fallbackCities.map((city) => ({ description: city })),
        });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            input
        )}&types=(cities)&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        return NextResponse.json({
            predictions: data.predictions || [],
        });
    } catch (error) {
        console.error("Places API error:", error);
        return NextResponse.json({ predictions: [] });
    }
}
