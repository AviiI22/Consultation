import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

const client = twilio(accountSid, authToken);

interface BookingDetails {
    bookingId: string;
    name: string;
    consultationType: string;
    btrOption: string;
    duration: number;
    consultationDate: string;
    consultationTime: string;
    dob: string;
    tob: string;
    gender: string;
    email: string;
    phone: string;
    birthPlace: string;
    concern: string;
    amount: number;
}

function formatMessage(booking: BookingDetails): string {
    const type = booking.consultationType === "urgent" ? "Urgent" : "Normal";
    const btr = booking.btrOption === "with-btr" ? "With BTR" : "Without BTR";
    const dur = booking.duration === 60 ? "1 Hour" : "30 Minutes";

    return [
        `✅ *Booking Confirmed!*`,
        ``,
        `*Booking ID:* ${booking.bookingId.slice(0, 12)}`,
        ``,
        `📋 *Consultation Details*`,
        `• Type: ${type}`,
        `• BTR: ${btr}`,
        `• Duration: ${dur}`,
        `• Date: ${booking.consultationDate}`,
        `• Time: ${booking.consultationTime}`,
        ``,
        `👤 *Personal Details*`,
        `• Name: ${booking.name}`,
        `• DOB: ${booking.dob}`,
        `• TOB: ${booking.tob}`,
        `• Gender: ${booking.gender}`,
        `• Email: ${booking.email}`,
        `• Birth Place: ${booking.birthPlace}`,
        ``,
        `📝 *Concern:* ${booking.concern}`,
        ``,
        `💰 *Amount Paid:* ₹${booking.amount}`,
        ``,
        `Thank you for your booking! Our astrologer will connect with you at the scheduled time. 🙏`,
    ].join("\n");
}

export async function sendWhatsAppConfirmation(
    booking: BookingDetails,
    toPhone: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Format phone number: ensure it starts with country code
        let formattedPhone = toPhone.replace(/\s+/g, "");
        if (!formattedPhone.startsWith("+")) {
            // Assume Indian number if no country code
            if (formattedPhone.length === 10) {
                formattedPhone = "+91" + formattedPhone;
            } else {
                formattedPhone = "+" + formattedPhone;
            }
        }

        const message = await client.messages.create({
            body: formatMessage(booking),
            from: fromWhatsApp,
            to: `whatsapp:${formattedPhone}`,
        });

        console.log(`WhatsApp message sent: ${message.sid}`);
        return { success: true };
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        console.error("WhatsApp notification failed:", errMsg);
        return { success: false, error: errMsg };
    }
}
