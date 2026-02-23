// Seed timeslots and pricing via the running dev server API
const BASE = "http://localhost:3000";

async function main() {
    // Step 1: Get CSRF token
    const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfCookies = csrfRes.headers.getSetCookie() || [];
    console.log("CSRF token obtained");

    // Step 2: Login to get session
    const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": csrfCookies.join("; "),
        },
        body: new URLSearchParams({
            email: "admin@astrology.com",
            password: "admin123",
            csrfToken: csrfData.csrfToken,
            json: "true",
        }),
        redirect: "manual",
    });

    const sessionCookies = loginRes.headers.getSetCookie() || [];
    const allCookies = [...csrfCookies, ...sessionCookies].join("; ");
    console.log("Login status:", loginRes.status);

    // Check session
    const sessionRes = await fetch(`${BASE}/api/auth/session`, {
        headers: { "Cookie": allCookies },
    });
    const session = await sessionRes.json();
    console.log("Session:", session.user ? `Logged in as ${session.user.email}` : "NOT LOGGED IN");

    if (!session.user) {
        console.error("Failed to authenticate. Cannot seed data.");
        process.exit(1);
    }

    // Step 3: Add timeslots
    const days = [0, 1, 2, 3, 4, 5, 6];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"];

    console.log("\n--- Adding Timeslots ---");
    let added = 0, skipped = 0;
    for (const day of days) {
        for (const slot of timeSlots) {
            const res = await fetch(`${BASE}/api/admin/availability`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Cookie": allCookies },
                body: JSON.stringify({ dayOfWeek: day, timeSlot: slot }),
            });
            const data = await res.json();
            if (res.ok) {
                console.log(`  + ${dayNames[day]} ${slot}`);
                added++;
            } else {
                console.log(`  - ${dayNames[day]} ${slot} (${data.error})`);
                skipped++;
            }
        }
    }
    console.log(`Added: ${added}, Skipped: ${skipped}`);

    // Step 4: Update pricing
    console.log("\n--- Updating Pricing ---");
    const priceRes = await fetch(`${BASE}/api/admin/pricing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Cookie": allCookies },
        body: JSON.stringify({
            inrNormal40: 7000,
            inrNormal90: 15000,
            inrUrgent40: 21000,
            inrUrgent90: 21000,
            inrBtr: 5000,
            inrNormal: 7000,
            inrUrgent: 21000,
        }),
    });
    const priceData = await priceRes.json();
    if (priceRes.ok && priceData.pricing) {
        const p = priceData.pricing;
        console.log(`  40min Normal: INR ${p.inrNormal40}`);
        console.log(`  90min Normal: INR ${p.inrNormal90}`);
        console.log(`  40min Urgent: INR ${p.inrUrgent40}`);
        console.log(`  90min Urgent: INR ${p.inrUrgent90}`);
        console.log(`  BTR Add-on:  INR ${p.inrBtr}`);
    } else {
        console.error("Pricing update failed:", priceData);
    }

    console.log("\nDone!");
}

main().catch(console.error);
