"use client";

import Link from "next/link";
import { ArrowRight, Mail, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

function ResumeBookingBanner() {
    const [step, setStep] = useState<number | null>(null);

    useEffect(() => {
        const savedStep = localStorage.getItem("booking_currentStep");
        const savedForm = localStorage.getItem("booking_formData");
        if (savedStep && savedForm) {
            const s = parseInt(savedStep);
            // Only show banner if they're past step 1 and haven't confirmed yet
            if (s > 1 && s < 7) {
                setStep(s);
            }
        }
    }, []);

    if (!step) return null;

    const stepLabel = (s: number) => {
        if (s <= 2) return "Consultation Type";
        if (s === 3) return "BTR Option";
        if (s === 4) return "Schedule";
        if (s === 5) return "Personal Details";
        if (s === 6) return "Summary & Payment";
        return "Booking";
    };

    const stepPath = (s: number) => {
        if (s <= 2) return "/consultation-type";
        if (s === 3) return "/btr-option";
        if (s === 4) return "/schedule";
        if (s === 5) return "/details";
        if (s === 6) return "/summary";
        return "/book";
    };

    return (
        <div className="absolute top-4 left-4 right-4 flex justify-center z-10">
            <div className="bg-white/90 backdrop-blur-md border border-gold-200 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-4 max-w-md w-full">
                <RotateCcw className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">You have an unfinished booking</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        Continue from: <span className="text-gold-600">{stepLabel(step)}</span>
                    </p>
                </div>
                <Link
                    href={stepPath(step)}
                    className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-xs font-semibold transition-all"
                >
                    Resume
                </Link>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-cream-100 flex flex-col">
            {/* Hero — full viewport */}
            <section className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-gold-50/30" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-gold-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-300/10 rounded-full blur-3xl animate-pulse delay-1000" />

                {/* Resume Booking Banner */}
                <ResumeBookingBanner />

                <div className="relative text-center px-4 py-16 sm:py-24">
                    <p className="text-xs sm:text-sm md:text-base text-gold-600 font-medium tracking-[0.3em] uppercase mb-4 sm:mb-6">
                        Vedic Astrologer
                    </p>

                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-gold-gradient leading-tight mb-3 sm:mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Sanskar Dixit
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl font-serif text-gray-500 italic mb-8 sm:mb-12">
                        &ldquo;Experience true jyotish&rdquo;
                    </p>

                    <Link
                        href="/book"
                        className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gold-500 hover:bg-gold-400 text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/30 active:scale-[0.98]"
                    >
                        Book a Consultation
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="mt-4">
                        <Link
                            href="/manage-booking"
                            className="inline-flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-500 font-medium transition-colors underline underline-offset-4 decoration-gold-300 hover:decoration-gold-500"
                        >
                            Already booked? Manage your booking
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-cream-300/50">
                <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="w-4 h-4 text-gold-500" />
                        <a
                            href="mailto:work.astro.avii@gmail.com"
                            className="hover:text-gold-600 transition-colors"
                        >
                            work.astro.avii@gmail.com
                        </a>
                    </div>
                    <p className="text-xs text-cream-600">
                        © {new Date().getFullYear()} Sanskar Dixit
                        {" · "}<Link href="/admin/login" className="hover:text-gold-500 transition-colors">Admin</Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}
