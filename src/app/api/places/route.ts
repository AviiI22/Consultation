import { NextRequest, NextResponse } from "next/server";

// Comprehensive global cities fallback — used when Google Places API key is not configured
const GLOBAL_CITIES = [
    // India
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
    "Indore, Madhya Pradesh, India",
    "Nagpur, Maharashtra, India",
    "Surat, Gujarat, India",
    "Vadodara, Gujarat, India",
    "Visakhapatnam, Andhra Pradesh, India",
    "Coimbatore, Tamil Nadu, India",
    "Kochi, Kerala, India",
    "Dehradun, Uttarakhand, India",
    "Ranchi, Jharkhand, India",
    "Raipur, Chhattisgarh, India",
    "Varanasi, Uttar Pradesh, India",
    "Agra, Uttar Pradesh, India",
    "Amritsar, Punjab, India",
    "Jodhpur, Rajasthan, India",
    "Udaipur, Rajasthan, India",
    "Kanpur, Uttar Pradesh, India",
    "Noida, Uttar Pradesh, India",
    "Gurgaon, Haryana, India",
    "Faridabad, Haryana, India",
    "Mysore, Karnataka, India",
    "Mangalore, Karnataka, India",
    "Madurai, Tamil Nadu, India",
    "Nashik, Maharashtra, India",
    "Aurangabad, Maharashtra, India",
    "Thane, Maharashtra, India",
    "Bhubaneswar, Odisha, India",
    "Vijayawada, Andhra Pradesh, India",
    "Tiruchirappalli, Tamil Nadu, India",
    "Salem, Tamil Nadu, India",
    "Jalandhar, Punjab, India",
    "Ludhiana, Punjab, India",
    "Meerut, Uttar Pradesh, India",
    "Allahabad, Uttar Pradesh, India",
    "Gwalior, Madhya Pradesh, India",
    "Jammu, Jammu and Kashmir, India",
    "Srinagar, Jammu and Kashmir, India",
    "Shimla, Himachal Pradesh, India",
    "Rishikesh, Uttarakhand, India",
    "Ujjain, Madhya Pradesh, India",
    // Nepal
    "Kathmandu, Nepal",
    "Pokhara, Nepal",
    "Biratnagar, Nepal",
    "Lalitpur, Nepal",
    // Sri Lanka
    "Colombo, Sri Lanka",
    "Kandy, Sri Lanka",
    "Galle, Sri Lanka",
    // Bangladesh
    "Dhaka, Bangladesh",
    "Chittagong, Bangladesh",
    "Sylhet, Bangladesh",
    // Pakistan
    "Karachi, Pakistan",
    "Lahore, Pakistan",
    "Islamabad, Pakistan",
    // United States
    "New York, NY, United States",
    "Los Angeles, CA, United States",
    "Chicago, IL, United States",
    "Houston, TX, United States",
    "Phoenix, AZ, United States",
    "Philadelphia, PA, United States",
    "San Antonio, TX, United States",
    "San Diego, CA, United States",
    "Dallas, TX, United States",
    "San Jose, CA, United States",
    "San Francisco, CA, United States",
    "Seattle, WA, United States",
    "Denver, CO, United States",
    "Boston, MA, United States",
    "Miami, FL, United States",
    "Atlanta, GA, United States",
    "Washington, DC, United States",
    "Austin, TX, United States",
    "Portland, OR, United States",
    "Las Vegas, NV, United States",
    // Canada
    "Toronto, Ontario, Canada",
    "Vancouver, British Columbia, Canada",
    "Montreal, Quebec, Canada",
    "Calgary, Alberta, Canada",
    "Edmonton, Alberta, Canada",
    "Ottawa, Ontario, Canada",
    // United Kingdom
    "London, United Kingdom",
    "Manchester, United Kingdom",
    "Birmingham, United Kingdom",
    "Edinburgh, Scotland, United Kingdom",
    "Glasgow, Scotland, United Kingdom",
    "Liverpool, United Kingdom",
    "Leeds, United Kingdom",
    "Bristol, United Kingdom",
    // UAE
    "Dubai, United Arab Emirates",
    "Abu Dhabi, United Arab Emirates",
    "Sharjah, United Arab Emirates",
    // Saudi Arabia
    "Riyadh, Saudi Arabia",
    "Jeddah, Saudi Arabia",
    "Mecca, Saudi Arabia",
    "Medina, Saudi Arabia",
    // Qatar, Kuwait, Oman, Bahrain
    "Doha, Qatar",
    "Kuwait City, Kuwait",
    "Muscat, Oman",
    "Manama, Bahrain",
    // Singapore & Malaysia
    "Singapore, Singapore",
    "Kuala Lumpur, Malaysia",
    "Penang, Malaysia",
    "Johor Bahru, Malaysia",
    // Australia & New Zealand
    "Sydney, NSW, Australia",
    "Melbourne, VIC, Australia",
    "Brisbane, QLD, Australia",
    "Perth, WA, Australia",
    "Auckland, New Zealand",
    "Wellington, New Zealand",
    // Germany
    "Berlin, Germany",
    "Munich, Germany",
    "Frankfurt, Germany",
    "Hamburg, Germany",
    // France
    "Paris, France",
    "Lyon, France",
    "Marseille, France",
    // Other Europe
    "Amsterdam, Netherlands",
    "Rome, Italy",
    "Milan, Italy",
    "Madrid, Spain",
    "Barcelona, Spain",
    "Stockholm, Sweden",
    "Zurich, Switzerland",
    "Dublin, Ireland",
    "Warsaw, Poland",
    "Prague, Czech Republic",
    "Vienna, Austria",
    "Brussels, Belgium",
    "Lisbon, Portugal",
    "Copenhagen, Denmark",
    "Oslo, Norway",
    "Helsinki, Finland",
    "Athens, Greece",
    "Istanbul, Turkey",
    "Moscow, Russia",
    "St. Petersburg, Russia",
    // East Asia
    "Tokyo, Japan",
    "Osaka, Japan",
    "Seoul, South Korea",
    "Beijing, China",
    "Shanghai, China",
    "Shenzhen, China",
    "Hong Kong, China",
    "Taipei, Taiwan",
    // Southeast Asia
    "Bangkok, Thailand",
    "Jakarta, Indonesia",
    "Manila, Philippines",
    "Ho Chi Minh City, Vietnam",
    "Hanoi, Vietnam",
    // Africa
    "Lagos, Nigeria",
    "Nairobi, Kenya",
    "Cairo, Egypt",
    "Johannesburg, South Africa",
    "Cape Town, South Africa",
    "Accra, Ghana",
    "Addis Ababa, Ethiopia",
    "Dar es Salaam, Tanzania",
    // South America
    "São Paulo, Brazil",
    "Rio de Janeiro, Brazil",
    "Buenos Aires, Argentina",
    "Santiago, Chile",
    "Bogotá, Colombia",
    "Lima, Peru",
    "Mexico City, Mexico",
    "Guadalajara, Mexico",
    "Monterrey, Mexico",
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input");

    if (!input || input.length < 2) {
        return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey || apiKey === "placeholder_key") {
        // Fallback: match against comprehensive global city list
        const query = input.toLowerCase();
        const matched = GLOBAL_CITIES.filter((city) =>
            city.toLowerCase().includes(query)
        ).slice(0, 8);

        return NextResponse.json({
            predictions: matched.map((city) => ({ description: city })),
        });
    }

    try {
        // Google Places Autocomplete — no region restriction for global coverage
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
