"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-cream-100">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-300/50">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="font-serif text-lg text-gold-gradient tracking-wide">
                        ✦ Astrology Consultation
                    </Link>
                    <Link
                        href="/book"
                        className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-all"
                    >
                        Book Now
                    </Link>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-10">
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-cream-600 hover:text-gold-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-gold-500" />
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
                        Privacy <span className="text-gold-gradient">Policy</span>
                    </h1>
                </div>

                <div className="bg-white rounded-2xl border border-cream-400/50 p-6 sm:p-8 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
                    <p className="text-xs text-cream-500">Last updated: March 2026</p>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">1. Information We Collect</h2>
                        <p>When you book a consultation, we collect the following personal information:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                            <li><strong>Contact Details:</strong> Name, email address, phone number</li>
                            <li><strong>Birth Details:</strong> Date of birth, time of birth, place of birth, gender</li>
                            <li><strong>Consultation Details:</strong> Your concern/question, consultation type, preferred date and time</li>
                            <li><strong>Payment Information:</strong> Payment is processed securely by Cashfree. We do not store your card details.</li>
                            <li><strong>Technical Data:</strong> Timezone, browser type (automatically detected for scheduling purposes)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">2. How We Use Your Information</h2>
                        <p>Your information is used solely for:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                            <li>Providing your astrology consultation</li>
                            <li>Scheduling and sending meeting links</li>
                            <li>Sending booking confirmations and reminders via email</li>
                            <li>Generating invoices and receipts</li>
                            <li>Improving our services</li>
                        </ul>
                        <p className="mt-2">
                            Your birth details (date, time, place of birth) are essential for astrological
                            analysis and are used exclusively for your consultation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">3. Data Storage & Security</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Your data is stored securely in an encrypted database hosted on Supabase (PostgreSQL)</li>
                            <li>All data transmission is encrypted using HTTPS/TLS</li>
                            <li>Payment processing is handled by Cashfree, a PCI-DSS compliant payment gateway</li>
                            <li>Access to your data is restricted to the astrologer and authorised personnel only</li>
                            <li>We do not store sensitive personal data in your browser's local storage</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">4. Data Sharing</h2>
                        <p>
                            We do <strong>not</strong> sell, trade, or share your personal information with
                            third parties, except:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                            <li><strong>Payment Processing:</strong> Cashfree receives necessary payment details to process transactions</li>
                            <li><strong>Email Services:</strong> Gmail SMTP is used to send you booking confirmations and reminders</li>
                            <li><strong>Video Meetings:</strong> Google Meet is used for online consultations</li>
                            <li><strong>Legal Obligations:</strong> If required by law or legal proceedings</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                            <li>Request access to the personal data we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data (subject to legal and booking obligations)</li>
                            <li>Withdraw consent for email communications</li>
                        </ul>
                        <p className="mt-2">
                            To exercise any of these rights, email us at{" "}
                            <a href="mailto:work.astro.avii@gmail.com" className="text-gold-600 hover:text-gold-500 underline">
                                work.astro.avii@gmail.com
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">6. Cookies & Local Storage</h2>
                        <p>
                            We use browser local storage to save your booking progress (consultation type,
                            date, and time selection only — no personal information). This data is
                            automatically cleared after 2 hours or upon booking completion. We use Vercel
                            Analytics for anonymous performance monitoring.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">7. Data Retention</h2>
                        <p>
                            Booking records are retained for a period necessary to provide our services,
                            handle refund requests, and comply with legal obligations. Unfulfilled or
                            abandoned bookings (pending payments) are automatically deleted after 2 hours.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">8. Changes to This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. Significant changes will
                            be communicated via email to existing clients. The &quot;Last updated&quot; date
                            at the top of this page indicates when the policy was last revised.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">9. Contact</h2>
                        <p>
                            For questions about this privacy policy or your data, contact us at:{" "}
                            <a href="mailto:work.astro.avii@gmail.com" className="text-gold-600 hover:text-gold-500 underline">
                                work.astro.avii@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
