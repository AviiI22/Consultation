import nodemailer from "nodemailer";
import { escapeHtml } from "./html-escape";

// Gmail SMTP transporter
// Uses Gmail App Password (NOT your regular Gmail password)
// Setup: Google Account > Security > 2-Step Verification > App Passwords > Create
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

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

  // HTML-escape all user-provided values to prevent XSS
  const safeName = escapeHtml(booking.name);
  const safeDob = escapeHtml(booking.dob);
  const safeTob = escapeHtml(booking.tob);
  const safeGender = escapeHtml(booking.gender);
  const safeEmail = escapeHtml(booking.email);
  const safePhone = escapeHtml(booking.phone);
  const safeBirthPlace = escapeHtml(booking.birthPlace);
  const safeConcern = escapeHtml(booking.concern);
  const safeBookingId = escapeHtml(booking.bookingId.slice(0, 12));
  const safeMeetingLink = escapeHtml(booking.meetingLink || "");
  const safeDate = escapeHtml(booking.consultationDate);
  const safeTime = escapeHtml(booking.consultationTime);
  const safeTimezone = escapeHtml(booking.userTimezone || "IST");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #A07B1A, #C9A227); padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">✦ Booking Confirmed ✦</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your astrology consultation has been booked</p>
        ${booking.meetingLink ? `
          <div style="margin-top: 20px;">
            <a href="${safeMeetingLink}" style="display: inline-block; background: #fff; color: #A07B1A; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
              📹 Join Google Meet
            </a>
          </div>
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 8px 0 0;">Click the button at your scheduled time to join</p>
        ` : ''}
      </div>

      <div style="padding: 32px 24px;">
        <!-- Greeting -->
        <p style="color: #2D2A26; font-size: 16px; margin: 0 0 24px;">
          Dear <strong>${safeName}</strong>, thank you for your booking!
        </p>

        <!-- Booking ID -->
        <div style="background: #fff; border: 1px solid #E8E4DB; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Booking ID</p>
          <p style="color: #C9A227; font-size: 18px; font-weight: 700; margin: 0; font-family: monospace;">${safeBookingId}</p>
        </div>

        ${booking.meetingLink ? `
        <!-- Meeting Link Box -->
        <div style="background: #EEF4FF; border: 1px solid #BFD4FF; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #2563EB; font-size: 13px; font-weight: 700; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.5px;">🔗 Google Meet Link</p>
          <a href="${safeMeetingLink}" style="color: #1D4ED8; font-size: 13px; word-break: break-all;">${safeMeetingLink}</a>
          <p style="color: #64748B; font-size: 12px; margin: 6px 0 0;">Date: ${safeDate} &nbsp;|&nbsp; Time: ${safeTime} (${safeTimezone})</p>
        </div>
        ` : ''}

        <!-- Consultation Details -->
        <h3 style="color: #A07B1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #E8E4DB; padding-bottom: 8px;">📋 Consultation Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Type</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${type}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">BTR</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${btr}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Duration</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${dur}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeDate}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeTime}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Timezone</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeTimezone}</td></tr>
        </table>

        <!-- Personal Details -->
        <h3 style="color: #A07B1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #E8E4DB; padding-bottom: 8px;">👤 Personal Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Name</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeName}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date of Birth</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeDob}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time of Birth</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeTob}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Gender</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeGender}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safePhone}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Birth Place</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 500;">${safeBirthPlace}</td></tr>
        </table>

        <!-- Concern -->
        <h3 style="color: #A07B1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; border-bottom: 1px solid #E8E4DB; padding-bottom: 8px;">📝 Your Concern</h3>
        <p style="color: #2D2A26; font-size: 14px; line-height: 1.6; background: #fff; border: 1px solid #E8E4DB; border-radius: 8px; padding: 16px;">${safeConcern}</p>

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
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn("Email skipped: GMAIL_USER or GMAIL_APP_PASSWORD not set.");
    return { success: false, error: "Email credentials not configured" };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Astrology Consultation" <${gmailUser}>`,
      to: booking.email,
      subject: `✦ Booking Confirmed — ${booking.consultationDate} at ${booking.consultationTime}`,
      html: buildEmailHtml(booking),
    });

    console.log(`✅ Email sent: ${info.messageId}`);
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
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return { success: false, error: "Email credentials not configured" };
  }

  try {
    const transporter = createTransporter();
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    // Send individually to avoid spam filters and BCC leaking
    const promises = recipients.map((to) =>
      transporter.sendMail({
        from: `"Astrology Consultation" <${gmailUser}>`,
        to,
        subject,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden; border: 1px solid #E8E4DB;">
            <div style="background: #A07B1A; padding: 24px; text-align: center; color: #fff;">
              <h1 style="margin: 0; font-size: 20px;">✦ Announcement ✦</h1>
            </div>
            <div style="padding: 32px 24px; color: #2D2A26; line-height: 1.6;">
              ${safeMessage}
            </div>
            <div style="background: #F5F3EE; padding: 16px; text-align: center; font-size: 12px; color: #A8A290;">
              <p style="margin: 0 0 8px;">© 2026 Astrology Consultation</p>
              <p style="margin: 0; color: #C0B8A8;">
                You received this email because you booked a consultation with us.
                To unsubscribe, reply to this email with "UNSUBSCRIBE" in the subject.
              </p>
            </div>
          </div>
        `,
      })
    );

    await Promise.allSettled(promises);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send a notification email to the admin when a new booking is paid.
 */
export async function sendAdminNotification(
  booking: BookingDetails
): Promise<{ success: boolean; error?: string }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!gmailUser || !gmailPass || !adminEmail) {
    return { success: false, error: "Email credentials or admin email not configured" };
  }

  try {
    const transporter = createTransporter();
    const safeName = escapeHtml(booking.name);
    const safeEmail = escapeHtml(booking.email);
    const safePhone = escapeHtml(booking.phone);
    const safeConcern = escapeHtml(booking.concern);

    const info = await transporter.sendMail({
      from: `"Booking Alert" <${gmailUser}>`,
      to: adminEmail,
      subject: `🔔 New Booking: ${booking.name} — ${booking.consultationDate} at ${booking.consultationTime}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden; border: 1px solid #E8E4DB;">
          <div style="background: linear-gradient(135deg, #1E40AF, #3B82F6); padding: 24px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 20px;">🔔 New Paid Booking</h1>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Client</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 600;">${safeName}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right;">${safeEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right;">${safePhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 600;">${escapeHtml(booking.consultationDate)}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right; font-weight: 600;">${escapeHtml(booking.consultationTime)}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Type</td><td style="padding: 8px 0; color: #2D2A26; font-size: 14px; text-align: right;">${booking.consultationType === "urgent" ? "Urgent" : "Normal"} · ${booking.btrOption === "with-btr" ? "With BTR" : "Without BTR"}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Amount</td><td style="padding: 8px 0; color: #059669; font-size: 18px; text-align: right; font-weight: 700;">${booking.currency || 'INR'} ${booking.amount}</td></tr>
            </table>
            ${booking.concern ? `
              <div style="margin-top: 16px; background: #fff; border: 1px solid #E8E4DB; border-radius: 8px; padding: 12px;">
                <p style="color: #888; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Concern</p>
                <p style="color: #2D2A26; font-size: 14px; margin: 0; line-height: 1.5;">${safeConcern}</p>
              </div>
            ` : ''}
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'https://localhost:3000'}/admin" style="display: inline-block; background: #1E40AF; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                View in Dashboard →
              </a>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`✅ Admin notification sent: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin notification email failed:", errMsg);
    return { success: false, error: errMsg };
  }
}
