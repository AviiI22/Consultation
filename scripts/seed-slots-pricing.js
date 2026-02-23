const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const days = [0, 1, 2, 3, 4, 5, 6];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
                console.log(`  skip ${dayNames[day]} ${slot} (exists)`);
            } else {
                await prisma.availability.create({
                    data: { dayOfWeek: day, timeSlot: slot, isActive: true },
                });
                console.log(`  + ${dayNames[day]} ${slot}`);
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
        inrNormal: 7000,
        inrUrgent: 21000,
    };

    if (existing) {
        await prisma.pricing.update({ where: { id: existing.id }, data: priceData });
        console.log("  Pricing updated!");
    } else {
        await prisma.pricing.create({ data: priceData });
        console.log("  Pricing created!");
    }

    const pricing = await prisma.pricing.findFirst();
    console.log("\nFinal pricing:");
    console.log(`  40min Normal: ${pricing.inrNormal40}`);
    console.log(`  90min Normal: ${pricing.inrNormal90}`);
    console.log(`  40min Urgent: ${pricing.inrUrgent40}`);
    console.log(`  90min Urgent: ${pricing.inrUrgent90}`);
    console.log(`  BTR Add-on:  ${pricing.inrBtr}`);

    const count = await prisma.availability.count();
    console.log(`\nTotal availability slots: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
