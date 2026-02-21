import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: "desc" },
            take: 5
        });
        console.log("Latest Bookings Status:");
        bookings.forEach(b => {
            console.log(`- ID: ${b.id}, Email: ${b.email}, Status: ${b.paymentStatus}, Created: ${b.createdAt}`);
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
