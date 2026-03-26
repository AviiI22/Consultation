import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refunds & Cancellations | Sanskar Dixit — Vedic Astrology",
    description:
        "Refund and cancellation policy for vedic astrology consultation services by Sanskar Dixit.",
};

export default function RefundsPage() {
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
                    Refunds &amp; Cancellations
                </h1>
                <p className="text-sm text-gray-400 mb-10">
                    Last updated: March 2026
                </p>

                <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Cancellation Policy
                        </h2>
                        <p>
                            We understand that plans can change. However, please note the
                            following:
                        </p>
                        <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
                            <li>
                                <strong>Cancellations made more than 12 hours before</strong> the
                                scheduled consultation are permitted and may be eligible for a
                                refund.
                            </li>
                            <li>
                                <strong>
                                    Cancellations within 12 hours of the scheduled consultation
                                </strong>{" "}
                                are <strong>not</strong> available. This includes no-shows and
                                last-minute cancellation requests.
                            </li>
                        </ul>
                        <p className="mt-3">
                            To cancel a booking, visit the{" "}
                            <Link
                                href="/manage-booking"
                                className="text-gold-600 hover:text-gold-500 underline underline-offset-2"
                            >
                                Manage Booking
                            </Link>{" "}
                            page, or email us at the address below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Refund Policy
                        </h2>
                        <p>
                            To request a refund, please email us at{" "}
                            <a
                                href="mailto:work.astro.avii@gmail.com"
                                className="text-gold-600 hover:text-gold-500 underline underline-offset-2"
                            >
                                work.astro.avii@gmail.com
                            </a>{" "}
                            with the following details:
                        </p>
                        <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
                            <li>Your full name</li>
                            <li>Booking ID</li>
                            <li>Reason for the refund request</li>
                        </ul>
                        <p className="mt-3">
                            Refund requests are reviewed on a case-by-case basis. Eligible
                            refunds will be processed within 7–10 business days to the original
                            payment method.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Non-Refundable Scenarios
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>
                                Cancellations requested within 12 hours of the scheduled
                                consultation.
                            </li>
                            <li>No-shows for the scheduled consultation.</li>
                            <li>
                                Consultations that have already been completed.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Contact Us
                        </h2>
                        <p>
                            For any questions regarding refunds or cancellations, please reach
                            out to us at{" "}
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
