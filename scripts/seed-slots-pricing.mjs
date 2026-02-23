import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"];

async function main() {
    // 1. Add 4 timeslots for every day
    console.log("Adding timeslots...");
    for (const day of days) {
        for (const slot of timeSlots) {
            const existing = await prisma.availability.findFirst({
                where: { dayOfWeek: day, timeSlot: slot },
            });
            if (existing) {
                console.log(`  ⏩ ${day} ${slot} already exists`);
            } else {
                await prisma.availability.create({
                    data: { dayOfWeek: day, timeSlot: slot, isActive: true },
                });
                console.log(`  ✅ ${day} ${slot} added`);
            }
        }
    }

    // 2. Update pricing
    console.log("\nUpdating pricing...");
    const existing = await prisma.pricing.findFirst();
    const priceData = {
        inrNormal40: 7000,
        inrNormal90: 15000,
        inrUrgent40: 21000,
        inrUrgent90: 21000,
        inrBtr: 5000,
        // Keep legacy fields in sync
        inrNormal: 7000,
        inrUrgent: 21000,
    };

    if (existing) {
        await prisma.pricing.update({
            where: { id: existing.id },
            data: priceData,
        });
        console.log("  ✅ Pricing updated");
    } else {
        await prisma.pricing.create({ data: priceData });
        console.log("  ✅ Pricing created");
    }

    // Show final state
    const slots = await prisma.availability.findMany({ orderBy: [{ dayOfWeek: "asc" }, { timeSlot: "asc" }] });
    console.log(`\nTotal slots: ${slots.length}`);
    const pricing = await prisma.pricing.findFirst();
    console.log("Pricing:", JSON.stringify(pricing, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
