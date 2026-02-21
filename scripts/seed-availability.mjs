import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slots = [
    { dayOfWeek: 1, timeSlot: "10:00 AM - 11:00 AM" },
    { dayOfWeek: 1, timeSlot: "11:00 AM - 12:00 PM" },
    { dayOfWeek: 1, timeSlot: "02:00 PM - 03:00 PM" },
    { dayOfWeek: 1, timeSlot: "03:00 PM - 04:00 PM" },
    { dayOfWeek: 1, timeSlot: "04:00 PM - 05:00 PM" },

    { dayOfWeek: 2, timeSlot: "10:00 AM - 11:00 AM" },
    { dayOfWeek: 2, timeSlot: "11:00 AM - 12:00 PM" },
    { dayOfWeek: 2, timeSlot: "02:00 PM - 03:00 PM" },
    { dayOfWeek: 2, timeSlot: "03:00 PM - 04:00 PM" },

    { dayOfWeek: 3, timeSlot: "10:00 AM - 11:00 AM" },
    { dayOfWeek: 3, timeSlot: "11:00 AM - 12:00 PM" },
    { dayOfWeek: 3, timeSlot: "02:00 PM - 03:00 PM" },
    { dayOfWeek: 3, timeSlot: "03:00 PM - 04:00 PM" },

    { dayOfWeek: 4, timeSlot: "10:00 AM - 11:00 AM" },
    { dayOfWeek: 4, timeSlot: "11:00 AM - 12:00 PM" },
    { dayOfWeek: 4, timeSlot: "02:00 PM - 03:00 PM" },
    { dayOfWeek: 4, timeSlot: "03:00 PM - 04:00 PM" },

    { dayOfWeek: 5, timeSlot: "10:00 AM - 11:00 AM" },
    { dayOfWeek: 5, timeSlot: "11:00 AM - 12:00 PM" },
    { dayOfWeek: 5, timeSlot: "02:00 PM - 03:00 PM" },
    { dayOfWeek: 5, timeSlot: "03:00 PM - 04:00 PM" },
];

async function main() {
    console.log("Seeding default availability slots...");
    for (const slot of slots) {
        await prisma.availability.upsert({
            where: { id: `seed-${slot.dayOfWeek}-${slot.timeSlot.replace(/\s/g, "-")}` },
            update: {},
            create: {
                id: `seed-${slot.dayOfWeek}-${slot.timeSlot.replace(/\s/g, "-")}`,
                ...slot,
                isActive: true
            }
        });
    }
    console.log("Seeding complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
