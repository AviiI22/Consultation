import { prisma } from "@/lib/prisma";
import { format, addHours } from "date-fns";
import { sendEmailConfirmation } from "@/lib/email";

export async function sendSessionReminders() {
    // Find sessions happening tomorrow
    const now = new Date();
    const tomorrow = addHours(now, 24);
    const targetDate = format(tomorrow, "yyyy-MM-dd");

    const bookings = await prisma.booking.findMany({
        where: {
            consultationDate: targetDate,
            paymentStatus: "Paid",
            status: "Upcoming",
        },
    });

    const results = {
        total: bookings.length,
        success: 0,
        failed: 0,
    };

    for (const booking of bookings) {
        try {
            await sendEmailConfirmation({
                bookingId: booking.id,
                name: booking.name,
                consultationType: booking.consultationType,
                btrOption: booking.btrOption,
                duration: booking.duration,
                consultationDate: booking.consultationDate,
                consultationTime: booking.consultationTime,
                dob: booking.dob,
                tob: booking.tob,
                gender: booking.gender,
                email: booking.email,
                phone: booking.phone,
                birthPlace: booking.birthPlace,
                concern: booking.concern,
                amount: booking.amount,
                currency: booking.currency || "INR",
                meetingLink: booking.meetingLink || null,
                userTimezone: booking.userTimezone || "Asia/Kolkata",
            });

            results.success++;
        } catch (error) {
            console.error(`Failed to send reminder for booking ${booking.id}:`, error);
            results.failed++;
        }
    }

    return results;
}
