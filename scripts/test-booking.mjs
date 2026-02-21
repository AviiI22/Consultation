import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testBooking() {
    const bookingData = {
        consultationType: "normal",
        btrOption: "without-btr",
        duration: 30,
        consultationDate: "2026-03-01",
        consultationTime: "10:00 AM - 11:00 AM",
        name: "Agent Antigravity",
        dob: "1990-01-01",
        tob: "10:30 AM",
        gender: "Male",
        email: "deathnote2295@gmail.com",
        phone: "8600405715",
        birthPlace: "Mumbai",
        concern: "Testing full flow verification and debugging glitches.",
        amount: 2499,
        currency: "INR",
        userTimezone: "Asia/Kolkata"
    };

    console.log("Attempting to create a booking with simulated data...");

    try {
        const response = await fetch(`${BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Success! Booking created:");
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.error(`Failed to create booking. Status: ${response.status}`);
            console.error("Error message:", result.error || "Unknown error");
        }
    } catch (error) {
        console.error("Error during fetch:", error.message);
    }
}

testBooking();
