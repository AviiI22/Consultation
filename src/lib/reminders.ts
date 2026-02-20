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
    const targetDate = format(tomorrow, "dd/MM/yyyy");

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
            await sendWhatsAppConfirmation(booking as any, booking.phone);

            // Send Email Reminder
            await sendEmailConfirmation({
                ...booking,
                bookingId: booking.id,
                consultationType: booking.consultationType,
                btrOption: booking.btrOption,
                userTimezone: (booking as any).userTimezone,
            } as any);

            results.success++;
        } catch (error) {
            console.error(`Failed to send reminder for booking ${booking.id}:`, error);
            results.failed++;
        }
    }

    return results;
}
