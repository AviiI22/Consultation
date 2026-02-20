"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Sparkles,
    Clock,
    Shield,
    Star,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Zap,
    Heart,
    Eye,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { useBooking } from "@/context/BookingContext";
import { PRICING, formatPrice } from "@/lib/pricing";

interface Testimonial {
    id: string;
    name: string;
    rating: number;
    text: string;
}

const FAQs = [
    {
        q: "What information do I need for the consultation?",
        a: "You'll need your date of birth, time of birth, place of birth, and a description of your concern. Accurate birth time is essential for precise astrological analysis.",
    },
    {
        q: "What is Birth Time Rectification (BTR)?",
        a: "BTR is a process to determine your exact birth time using life events and astrological techniques. It's especially helpful if you're unsure about your exact birth time.",
    },
    {
        q: "How long does a consultation take?",
        a: "We offer 30-minute and 60-minute sessions. Choose based on the depth of analysis you need — longer sessions allow for more detailed exploration.",
    },
    {
        q: "Is my personal data secure?",
        a: "Absolutely. Your birth details and personal information are encrypted and stored securely. We never share your data with third parties.",
    },
    {
        q: "What payment methods are accepted?",
        a: "We accept all major payment methods through Razorpay — credit/debit cards, UPI, net banking, and popular wallets.",
    },
    {
        q: "Can I reschedule or cancel my booking?",
        a: "Please contact us as early as possible if you need to reschedule. Cancellations are handled on a case-by-case basis.",
    },
];

export default function LandingPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const { currency } = useBooking();

    useEffect(() => {
        fetch("/api/testimonials")
            .then((r) => r.json())
            .then((d) => setTestimonials(d.testimonials || []))
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-cream-100/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-cream-300/50 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-serif text-lg sm:text-xl text-gold-gradient tracking-wide">
                        ✦ Astrology Consultation
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <CurrencyToggle />
                        </div>
                        <ThemeToggle />
                        <Link
                            href="/book"
                            className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-gold-500/20"
                        >
                            Book Now
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden py-20 sm:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-gold-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-gold-950/20" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-gold-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 text-gold-700 dark:text-gold-400 text-xs font-medium mb-6 animate-bounce">
                        <Sparkles className="w-3.5 h-3.5" />
                        Vedic Astrology • Personalized Readings
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-6">
                        Discover Your{" "}
                        <span className="text-gold-gradient">Cosmic Path</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Get personalized insights from expert Vedic astrology consultations.
                        Understand your birth chart, navigate life transitions, and find clarity in the stars.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/book"
                            className="group px-8 py-4 rounded-2xl bg-gold-500 hover:bg-gold-400 text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/30 active:scale-[0.98] flex items-center gap-2"
                        >
                            Start Your Journey
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#services"
                            className="px-8 py-4 rounded-2xl border-2 border-cream-400 dark:border-slate-800 text-gray-600 dark:text-gray-400 font-semibold text-lg hover:border-gold-500 hover:text-gold-600 transition-all duration-300"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-20 bg-white/50 dark:bg-slate-900/50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                            Our <span className="text-gold-gradient">Services</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            Choose the consultation that best fits your needs
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Eye,
                                title: "Normal Consultation",
                                desc: "Comprehensive birth chart analysis with detailed predictions and guidance for your life's journey.",
                                color: "text-gold-600 dark:text-gold-400",
                                bg: "bg-gold-50 dark:bg-gold-950/20",
                                border: "border-gold-200 dark:border-gold-800",
                            },
                            {
                                icon: Zap,
                                title: "Urgent Consultation",
                                desc: "Priority scheduling for time-sensitive queries. Get quick insights when you need them most.",
                                color: "text-red-600 dark:text-red-400",
                                bg: "bg-red-50 dark:bg-red-950/20",
                                border: "border-red-200 dark:border-red-800",
                            },
                            {
                                icon: Clock,
                                title: "Birth Time Rectification",
                                desc: "Determine your exact birth time through advanced astrological methods for more accurate readings.",
                                color: "text-blue-600 dark:text-blue-400",
                                bg: "bg-blue-50 dark:bg-blue-950/20",
                                border: "border-blue-200 dark:border-blue-800",
                            },
                        ].map((service) => (
                            <div
                                key={service.title}
                                className={`group rounded-2xl border ${service.border} ${service.bg} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <service.icon className={`w-6 h-6 ${service.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{service.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 bg-cream-50 dark:bg-slate-950">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                            Simple <span className="text-gold-gradient">Pricing</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">Transparent pricing with no hidden fees</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-cream-400/50 dark:border-slate-800 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <Clock className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                            <h3 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-200 mb-1">30 Minutes</h3>
                            <p className="text-3xl font-bold text-gold-600 dark:text-gold-400 my-4">
                                {formatPrice(PRICING[currency].NORMAL, currency)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Quick focused consultation</p>
                            <Link
                                href="/book"
                                className="inline-block px-6 py-3 rounded-xl bg-cream-100 dark:bg-slate-800 text-gold-700 dark:text-gold-400 font-medium text-sm border border-cream-400/50 dark:border-slate-700 hover:bg-gold-500 hover:text-white transition-all duration-300"
                            >
                                Book Now
                            </Link>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-b from-gold-50 to-white dark:from-slate-900 dark:to-slate-950 border-2 border-gold-300 dark:border-gold-800 p-8 text-center relative hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-white text-xs font-medium">
                                Popular
                            </div>
                            <Clock className="w-8 h-8 text-gold-500 mx-auto mb-3" />
                            <h3 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-200 mb-1">60 Minutes</h3>
                            <p className="text-3xl font-bold text-gold-600 dark:text-gold-400 my-4">
                                {formatPrice(PRICING[currency].NORMAL * 2, currency)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">In-depth detailed reading</p>
                            <Link
                                href="/book"
                                className="inline-block px-6 py-3 rounded-xl bg-gold-500 text-white font-medium text-sm hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/20"
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <section className="py-20 dark:bg-slate-900/30">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                                What Clients <span className="text-gold-gradient">Say</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {testimonials.slice(0, 6).map((t) => (
                                <div
                                    key={t.id}
                                    className="rounded-2xl bg-white dark:bg-slate-900 border border-cream-300/50 dark:border-slate-800 p-5 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex gap-0.5 mb-3">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < t.rating ? "text-gold-500 fill-gold-500" : "text-gray-200 dark:text-slate-700"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-300">— {t.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ */}
            <section className="py-20 bg-white/50 dark:bg-slate-900/50">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                            Frequently Asked <span className="text-gold-gradient">Questions</span>
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {FAQs.map((faq, i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-cream-300/50 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-cream-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    {faq.q}
                                    {openFaq === i ? (
                                        <ChevronUp className="w-4 h-4 text-gold-500 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-600 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-cream-300/50 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-xs text-cream-500 dark:text-slate-500">
                        ✦ Astrology Consultation · Discover Your Cosmic Path ·{" "}
                        <Link href="/admin/login" className="hover:text-gold-500 transition-colors">
                            Admin
                        </Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}
