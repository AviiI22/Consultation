"use client";

import { useEffect, useState } from "react";

/* ── Animated line that draws itself ── */
function AnimatedLine() {
    return (
        <div className="w-full max-w-[120px] h-[1px] overflow-hidden mx-auto my-8">
            <div
                className="h-full"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                    animation: "drawLine 2s ease-out forwards",
                }}
            />
        </div>
    );
}

/* ── Floating dot grid (subtle background texture) ── */
function DotGrid() {
    return (
        <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "32px 32px",
            }}
        />
    );
}

/* ── Subtle moving gradient orb ── */
function GradientOrb({ className = "" }: { className?: string }) {
    return (
        <div
            className={`absolute rounded-full pointer-events-none blur-[100px] ${className}`}
        />
    );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE — Under Construction
   ══════════════════════════════════════════════════════════════ */
export default function UnderConstructionPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{ background: "#0a0a0a" }}
        >
            {/* ── background effects ── */}
            <DotGrid />
            <GradientOrb className="w-[500px] h-[500px] -top-48 -left-48 bg-white/[0.02]" />
            <GradientOrb className="w-[600px] h-[600px] -bottom-64 -right-64 bg-white/[0.015]" />

            {/* ── subtle top border accent ── */}
            <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
                }}
            />

            {/* ── main content ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
                <div
                    className="max-w-lg w-full flex flex-col items-center text-center"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(20px)",
                        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                >
                    {/* badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] tracking-[0.2em] uppercase mb-10"
                        style={{
                            color: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                background: "#22c55e",
                                boxShadow: "0 0 8px rgba(34,197,94,0.4)",
                                animation: "pulse-dot 2s ease-in-out infinite",
                            }}
                        />
                        In Development
                    </div>

                    {/* heading */}
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight mb-5"
                        style={{
                            color: "#fafafa",
                            fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                    >
                        We&apos;re building
                        <br />
                        <span
                            style={{
                                background: "linear-gradient(135deg, #e0e0e0 0%, #666 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            something new.
                        </span>
                    </h1>

                    <AnimatedLine />

                    {/* description */}
                    <p
                        className="text-sm sm:text-base leading-relaxed max-w-sm"
                        style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300 }}
                    >
                        Our platform is currently under construction.
                        <br />
                        We&apos;ll be back with something worth the wait.
                    </p>

                    {/* email */}
                    <div
                        className="mt-12"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? "translateY(0)" : "translateY(12px)",
                            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                        }}
                    >
                        <a
                            href="mailto:work.astro.avii@gmail.com"
                            className="group inline-flex items-center gap-2.5 text-sm transition-all duration-300"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                            }}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            work.astro.avii@gmail.com
                        </a>
                    </div>
                </div>
            </main>

            {/* ── footer ── */}
            <footer className="relative z-10 py-6">
                <p
                    className="text-center text-[11px] tracking-wide"
                    style={{ color: "rgba(255,255,255,0.15)" }}
                >
                    © {new Date().getFullYear()} Sanskar Dixit
                </p>
            </footer>

            {/* ── keyframes ── */}
            <style jsx global>{`
                @keyframes drawLine {
                    from { width: 0; }
                    to   { width: 100%; }
                }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
