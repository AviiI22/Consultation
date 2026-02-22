const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runWriteTests() {
    console.log("=== Admin Write Operations Tests ===\n");

    try {
        // 1. Blocked Dates
        console.log("1. Testing Blocked Dates...");
        const testDate = "2026-12-25";
        const blocked = await prisma.blockedDate.upsert({
            where: { date: testDate },
            update: { reason: "Christmas Holiday (Updated)" },
            create: { date: testDate, reason: "Christmas Holiday" }
        });
        console.log("   [OK] Blocked date created/updated:", blocked.date);

        await prisma.blockedDate.delete({ where: { date: testDate } });
        console.log("   [OK] Blocked date deleted successfully.");

        // 2. Promo Codes
        console.log("\n2. Testing Promo Codes...");
        const testCode = "TESTPROMO99";
        const promo = await prisma.promoCode.upsert({
            where: { code: testCode },
            update: { discountPercent: 99 },
            create: { code: testCode, discountPercent: 50, maxUses: 10 }
        });
        console.log("   [OK] Promo code created/updated:", promo.code);

        await prisma.promoCode.delete({ where: { code: testCode } });
        console.log("   [OK] Promo code deleted successfully.");

        // 3. Testimonials
        console.log("\n3. Testing Testimonials...");
        const testimonial = await prisma.testimonial.create({
            data: { name: "Test User", rating: 5, text: "Great service!", isApproved: false }
        });
        console.log("   [OK] Testimonial created with ID:", testimonial.id);

        const approved = await prisma.testimonial.update({
            where: { id: testimonial.id },
            data: { isApproved: true }
        });
        console.log("   [OK] Testimonial approved status toggled.");

        await prisma.testimonial.delete({ where: { id: testimonial.id } });
        console.log("   [OK] Testimonial deleted successfully.");

        // 4. Availability Slots
        console.log("\n4. Testing Availability Slots...");
        const slot = await prisma.availability.create({
            data: { dayOfWeek: 0, timeSlot: "11:00 PM - 12:00 PM", isActive: true }
        });
        console.log("   [OK] Availability slot created with ID:", slot.id);

        await prisma.availability.delete({ where: { id: slot.id } });
        console.log("   [OK] Availability slot deleted successfully.");

        console.log("\n=== All Write Operations Tested Successfully ===");
    } catch (error) {
        console.error("\n[FAIL] Write operations test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runWriteTests();
