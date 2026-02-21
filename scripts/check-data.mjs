import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- Checking Availability ---");
        const slots = await prisma.availability.findMany();
        console.log(`Found ${slots.length} slots:`);
        slots.forEach(s => console.log(`  - Day ${s.dayOfWeek}, Slot: ${s.timeSlot}, Active: ${s.isActive}`));

        console.log("\n--- Checking Blocked Dates ---");
        const blocked = await prisma.blockedDate.findMany();
        console.log(`Found ${blocked.length} blocked dates:`);
        blocked.forEach(b => console.log(`  - ${b.date}: ${b.reason}`));

    } catch (error) {
        console.error("Error connecting to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
