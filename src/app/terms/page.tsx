import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | Sanskar Dixit — Vedic Astrology",
    description:
        "Terms and conditions for vedic astrology consultation services by Sanskar Dixit.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-cream-100">
            <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm text-gold-600 hover:text-gold-500 transition-colors mb-8"
                >
                    ← Back to Home
                </Link>

                <h1
                    className="text-3xl sm:text-4xl font-bold text-gold-gradient mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    Terms &amp; Conditions
                </h1>
                <p className="text-sm text-gray-400 mb-10">
                    Last updated: March 2026
                </p>

                <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            1. Introduction
                        </h2>
                        <p>
                            These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the
                            consultation services offered by Sanskar Dixit (&quot;we&quot;,
                            &quot;us&quot;, or &quot;our&quot;) through this website. By booking or
                            using our services, you agree to be bound by these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            2. Services
                        </h2>
                        <p>
                            We provide Vedic astrology (Jyotish Shastra) consultation services,
                            including but not limited to birth chart analysis, birth time
                            rectification, and personalised astrological guidance. All
                            consultations are conducted online via video conference.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            3. Eligibility
                        </h2>
                        <p>
                            By using our services you represent that you are at least 18 years of
                            age, or have the consent of a parent or legal guardian to book and
                            attend a consultation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            4. Payments
                        </h2>
                        <p>
                            All fees are displayed at the time of booking and must be paid in full
                            before the consultation is confirmed. Payments are processed through
                            our third-party payment gateway. We do not store your payment card
                            details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            5. Disclaimer &amp; Limitation of Liability
                        </h2>
                        <p>
                            Vedic astrology consultations are provided for informational and
                            spiritual guidance purposes only. They do <strong>not</strong>{" "}
                            constitute professional medical, legal, financial, or psychological
                            advice. You should always consult qualified professionals for such
                            matters.
                        </p>
                        <p className="mt-2">
                            We make no guarantees regarding the accuracy, completeness, or
                            applicability of any astrological interpretation. We shall not be held
                            liable for any decisions made, actions taken, or outcomes resulting
                            from the information provided during a consultation.
                        </p>
                        <p className="mt-2">
                            To the fullest extent permitted by law, our total liability for any
                            claim arising out of or related to these services shall not exceed the
                            amount paid by you for the specific consultation in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            6. Intellectual Property
                        </h2>
                        <p>
                            All content provided during consultations — including analysis,
                            interpretations, and recommendations — remains the intellectual
                            property of Sanskar Dixit. You may not reproduce, distribute, or
                            publicly share consultation content without prior written consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            7. Privacy &amp; Data Usage
                        </h2>
                        <p>
                            Personal information collected during the booking process (name,
                            email, phone number, birth details) is used solely for the purpose of
                            providing the consultation. We do not sell or share your personal data
                            with third parties except as required by law or to process your
                            payment.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            8. Cancellations &amp; Refunds
                        </h2>
                        <p>
                            Cancellations and refunds are subject to our{" "}
                            <Link
                                href="/refunds"
                                className="text-gold-600 hover:text-gold-500 underline underline-offset-2"
                            >
                                Refunds &amp; Cancellations Policy
                            </Link>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            9. Modifications
                        </h2>
                        <p>
                            We reserve the right to update or modify these Terms at any time
                            without prior notice. Continued use of our services after changes are
                            posted constitutes acceptance of the revised Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            10. Governing Law
                        </h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the
                            laws of India. Any disputes arising shall be subject to the exclusive
                            jurisdiction of the courts in India.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            11. Contact
                        </h2>
                        <p>
                            If you have questions about these Terms, please reach out at{" "}
                            <a
                                href="mailto:work.astro.avii@gmail.com"
                                className="text-gold-600 hover:text-gold-500 underline underline-offset-2"
                            >
                                work.astro.avii@gmail.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
