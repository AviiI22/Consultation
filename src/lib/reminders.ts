import { prisma } from "@/lib/prisma";
import { format, addHours, startOfHour, endOfHour } from "date-fns";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";
import { sendEmailConfirmation } from "@/lib/email";

export async function sendSessionReminders() {
    // Find sessions in the next 24 hours
    const now = new Date();
    const tomorrow = addHours(now, 24);

    // For this implementation, we search for bookings on the same date string
    // Simplified: Find all "Paid" bookings for "tomorrow"
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
            // Send WhatsApp Reminder
            // We use the same confirmation function or a dedicated reminder one
            // For now, let's reuse/adapt confirmation as it contains all info
            await sendWhatsAppConfirmation({
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
            }, booking.phone);

            // Send Email Reminder
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
                userTimezone: booking.userTimezone || "UTC",
            });

            results.success++;
        } catch (error) {
            console.error(`Failed to send reminder for booking ${booking.id}:`, error);
            results.failed++;
        }
    }

    return results;
}
