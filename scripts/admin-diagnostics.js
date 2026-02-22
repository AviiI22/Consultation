const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runDiagnostics() {
    console.log("=== Admin Dashboard Services Diagnostics ===\n");

    try {
        // 1. Pricing Service
        console.log("1. Checking Pricing Service...");
        const pricing = await prisma.pricing.findUnique({ where: { id: "singleton" } });
        console.log("   - Current Pricing Data:", JSON.stringify(pricing, null, 2));
        if (pricing && pricing.inrNormal40 !== undefined) {
            console.log("   [OK] Granular pricing fields are present.");
        } else {
            console.log("   [FAIL] Missing granular pricing fields.");
        }

        // 2. Bookings Service
        console.log("\n2. Checking Bookings Service...");
        const bookingCount = await prisma.booking.count();
        console.log(`   - Total Bookings: ${bookingCount}`);
        const latestBooking = await prisma.booking.findFirst({ orderBy: { createdAt: 'desc' } });
        if (latestBooking) {
            console.log("   - Latest Booking ID:", latestBooking.id);
            console.log("   [OK] Bookings are accessible.");
        } else {
            console.log("   [INFO] No bookings found in database yet.");
        }

        // 3. Availability Service
        console.log("\n3. Checking Availability Service...");
        const slotsCount = await prisma.availability.count();
        console.log(`   - Total Availability Slots: ${slotsCount}`);
        const firstSlot = await prisma.availability.findFirst();
        if (firstSlot) {
            console.log("   - Example Slot ID:", firstSlot.id);
            console.log("   [OK] Availability slots are accessible.");
        } else {
            console.log("   [INFO] No availability slots found.");
        }

        // 4. Promo Codes Service
        console.log("\n4. Checking Promo Codes Service...");
        const promoCount = await prisma.promoCode.count();
        console.log(`   - Total Promo Codes: ${promoCount}`);
        const firstPromo = await prisma.promoCode.findFirst();
        if (firstPromo) {
            console.log("   - Example Promo Code:", firstPromo.code);
            console.log("   [OK] Promo codes are accessible.");
        } else {
            console.log("   [INFO] No promo codes found.");
        }

        // 5. Testimonials Service
        console.log("\n5. Checking Testimonials Service...");
        const testimonialCount = await prisma.testimonial.count();
        console.log(`   - Total Testimonials: ${testimonialCount}`);
        const firstTestimonial = await prisma.testimonial.findFirst();
        if (firstTestimonial) {
            console.log("   - Example Testimonial Name:", firstTestimonial.name);
            console.log("   [OK] Testimonials are accessible.");
        } else {
            console.log("   [INFO] No testimonials found.");
        }

        // 6. Analytics Service (Aggregation test)
        console.log("\n6. Checking Analytics Logic...");
        const stats = await prisma.booking.aggregate({
            _sum: { amount: true },
            _count: { id: true }
        });
        console.log("   - Total Revenue (Sum):", stats._sum.amount || 0);
        console.log("   - Total Bookings (Count):", stats._count.id);
        console.log("   [OK] Analytics aggregation is working.");

        console.log("\n=== Diagnostics Completed Successfully ===");
    } catch (error) {
        console.error("\n[CRITICAL ERROR] Diagnostics failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runDiagnostics();
