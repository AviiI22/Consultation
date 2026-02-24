"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-cream-100 flex flex-col">
            {/* Hero — full viewport */}
            <section className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-gold-50/30" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-gold-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-300/10 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="relative text-center px-4 py-24">
                    <p className="text-sm sm:text-base text-gold-600 font-medium tracking-[0.3em] uppercase mb-6">
                        Vedic Astrology
                    </p>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-gold-gradient leading-tight mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Sanskar Dixit
                    </h1>

                    <p className="text-lg sm:text-xl font-serif text-gray-500 italic mb-12">
                        &ldquo;Experience true jyotish&rdquo;
                    </p>

                    <Link
                        href="/book"
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gold-500 hover:bg-gold-400 text-white font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/30 active:scale-[0.98]"
                    >
                        Book a Consultation
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
                        © {new Date().getFullYear()} Sanskar Dixit ·{" "}
                        <Link
                            href="/admin/login"
                            className="hover:text-gold-500 transition-colors"
                        >
                            Admin
                        </Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}
