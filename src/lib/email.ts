import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  currency: string;
  meetingLink?: string | null;
  userTimezone?: string;
}

function buildEmailHtml(booking: BookingDetails): string {
  const type = booking.consultationType === "urgent" ? "Urgent" : "Normal";
  const btr = booking.btrOption === "with-btr" ? "With BTR" : "Without BTR";
  const dur = booking.duration === 60 ? "1 Hour" : "30 Minutes";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #A07B1A, #C9A227); padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">✦ Booking Confirmed ✦</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your astrology consultation has been booked</p>
        ${booking.meetingLink ? `
          <div style="margin-top: 20px;">
            <a href="${booking.meetingLink}" style="display: inline-block; background: #fff; color: #A07B1A; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Join Meeting</a>
          </div>
        ` : ''}
      </div>

      <div style="padding: 32px 24px;">
        <!-- Greeting -->
        <p style="color: #2D2A26; font-size: 16px; margin: 0 0 24px;">
          Dear <strong>${booking.name}</strong>, thank you for your booking!
        </p>

        <!-- Booking ID -->
        <div style="background: #fff; border: 1px solid #E8E4DB; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Booking ID</p>
          <p style="color: #C9A227; font-size: 18px; font-weight: 700; margin: 0; font-family: monospace;">${booking.bookingId.slice(0, 12)}</p>
        </div>

        <!-- Consultation Details -->
        <h3 style="color: #A07B1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #E8E4DB; padding-bottom: 8px;">📋 Consultation Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Type</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${type}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">BTR</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${btr}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Duration</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${dur}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.consultationDate}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.consultationTime}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Timezone</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.userTimezone || 'IST'}</td></tr>
        </table>

        <!-- Personal Details -->
        <h3 style="color: #A07B1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #E8E4DB; padding-bottom: 8px;">👤 Personal Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Name</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date of Birth</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.dob}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time of Birth</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.tob}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Gender</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.gender}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.phone}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Birth Place</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${booking.birthPlace}</td></tr>
        </table>

        <!-- Concern -->
        <h3 style="color: #A07B1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #E8E4DB; padding-bottom: 8px;">📝 Your Concern</h3>
        <p style="color: #2D2A26; font-size: 14px; line-height: 1.6; background: #fff; border: 1px solid #E8E4DB; border-radius: 8px; padding: 16px;">${booking.concern}</p>

        <!-- Amount -->
        <div style="background: #fff; border: 1px solid #E8E4DB; border-radius: 8px; padding: 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #888; font-size: 14px;">Amount Paid</span>
          <span style="color: #2D2A26; font-size: 24px; font-weight: 700;">${booking.currency || 'INR'} ${booking.amount}</span>
        </div>

        <!-- Footer note -->
        <p style="color: #888; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
          Our astrologer will connect with you at the scheduled time. 🙏<br/>
          If you have questions, reply to this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F5F3EE; padding: 16px 24px; text-align: center; border-top: 1px solid #E8E4DB;">
        <p style="color: #A8A290; font-size: 12px; margin: 0;">© 2026 Astrology Consultation. All rights reserved.</p>
      </div>
    </div>
    `;
}

export async function sendEmailConfirmation(
  booking: BookingDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Astrology Consultation <onboarding@resend.dev>",
      to: booking.email,
      subject: `✦ Booking Confirmed — ${booking.consultationDate} at ${booking.consultationTime}`,
      html: buildEmailHtml(booking),
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error: error.message };
    }

    console.log(`Email sent: ${data?.id}`);
    return { success: true };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Email notification failed:", errMsg);
    return { success: false, error: errMsg };
  }
}

export async function sendBulkAnnouncement(
  recipients: string[],
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Astrology Consultation <onboarding@resend.dev>",
      to: recipients,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden; border: 1px solid #E8E4DB;">
          <div style="background: #A07B1A; padding: 24px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 20px;">✦ Announcement ✦</h1>
          </div>
          <div style="padding: 32px 24px; color: #2D2A26; line-height: 1.6;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <div style="background: #F5F3EE; padding: 16px; text-align: center; font-size: 12px; color: #A8A290;">
            © 2026 Astrology Consultation
          </div>
        </div>
        `,
    });

    if (error) {
      console.error("Resend bulk email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

