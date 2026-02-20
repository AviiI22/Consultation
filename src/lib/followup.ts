import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface FollowUpData {
    name: string;
    email: string;
    consultationDate: string;
    consultationTime: string;
}

export async function sendFollowUpEmail(data: FollowUpData) {
    try {
        const result = await resend.emails.send({
            from: "Astrology Consultation <onboarding@resend.dev>",
            to: data.email,
            subject: "Thank you for your consultation! ✦",
            html: `
                <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; padding: 40px 30px; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #C9A227; font-size: 24px; margin: 0;">✦ Thank You, ${data.name}! ✦</h1>
                    </div>

                    <p style="color: #2D2A26; font-size: 15px; line-height: 1.6;">
                        We hope your consultation on <strong>${data.consultationDate}</strong> at
                        <strong>${data.consultationTime}</strong> was insightful and helpful.
                    </p>

                    <p style="color: #2D2A26; font-size: 15px; line-height: 1.6;">
                        Your feedback means the world to us. If you have a moment, we'd love to hear about your experience.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/testimonials"
                           style="display: inline-block; background: #C9A227; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                            Share Your Experience
                        </a>
                    </div>

                    <div style="border-top: 1px solid #E8E4DB; padding-top: 20px; margin-top: 20px;">
                        <p style="color: #2D2A26; font-size: 15px; line-height: 1.6;">
                            Looking for more guidance? Book a follow-up session:
                        </p>
                        <div style="text-align: center; margin-top: 15px;">
                            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/book"
                               style="display: inline-block; border: 2px solid #C9A227; color: #C9A227; padding: 10px 25px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                Book Again
                            </a>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 30px; color: #A8A290; font-size: 12px;">
                        <p>✦ Astrology Consultation ✦</p>
                        <p>Discover Your Cosmic Path</p>
                    </div>
                </div>
            `,
        });

        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error("Follow-up email error:", error);
        return { success: false, error };
    }
}
