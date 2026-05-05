"use client";

import { Mail } from "lucide-react";
import { useEffect, useState } from "react";

/* ── tiny animated star field (CSS-only sparkles) ── */
function Sparkle({ style }: { style: React.CSSProperties }) {
    return (
        <span
            className="absolute rounded-full pointer-events-none"
            style={{
                width: 3,
                height: 3,
                background: "rgba(201,162,39,0.35)",
                boxShadow: "0 0 6px 2px rgba(201,162,39,0.15)",
                ...style,
            }}
        />
    );
}

/* ── animated gear SVG (rotates continuously) ── */
function Gear({ size = 48, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" opacity="0" />
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" opacity="0" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeOpacity="0.2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2" />
            <path d="M12 21v2" />
            <path d="m4.22 4.22 1.42 1.42" />
            <path d="m18.36 18.36 1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="m4.22 19.78 1.42-1.42" />
            <path d="m18.36 5.64 1.42-1.42" />
        </svg>
    );
}

/* ── progress bar ── */
function ProgressBar() {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(68), 400);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="w-full max-w-xs mx-auto mt-8">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1.5 font-medium tracking-wide">
                <span>Progress</span>
                <span>{width}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-cream-300/60 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-[1.8s] ease-out"
                    style={{
                        width: `${width}%`,
                        background: "linear-gradient(90deg, #A07B1A, #C9A227, #FFD966)",
                    }}
                />
            </div>
        </div>
    );
}

/* ── countdown timer ── */
function useCountdown() {
    // Target: 30 days from first visit (stored), or a fixed future date
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const getTarget = () => {
            const stored = localStorage.getItem("construction_target");
            if (stored) return parseInt(stored);
            const target = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
            localStorage.setItem("construction_target", target.toString());
            return target;
        };
        const target = getTarget();

        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span
                className="text-3xl sm:text-5xl font-bold tabular-nums"
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    background: "linear-gradient(135deg, #A07B1A 0%, #C9A227 50%, #FFD966 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mt-1">
                {label}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function UnderConstructionPage() {
    const { days, hours, minutes, seconds } = useCountdown();

    /* sparkle positions (deterministic so SSR = CSR) */
    const sparkles = [
        { top: "8%", left: "12%", animationDelay: "0s" },
        { top: "15%", left: "80%", animationDelay: "1.4s" },
        { top: "30%", left: "5%", animationDelay: "0.6s" },
        { top: "55%", left: "90%", animationDelay: "2.1s" },
        { top: "70%", left: "15%", animationDelay: "1.8s" },
        { top: "85%", left: "75%", animationDelay: "0.3s" },
        { top: "45%", left: "50%", animationDelay: "2.8s" },
        { top: "20%", left: "45%", animationDelay: "3.2s" },
        { top: "75%", left: "55%", animationDelay: "1.1s" },
        { top: "92%", left: "30%", animationDelay: "0.9s" },
    ];

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col relative overflow-hidden">
            {/* ── decorative blobs ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-gold-50/30 pointer-events-none" />
            <div className="absolute top-10 left-10 w-72 h-72 bg-gold-200/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-300/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-100/10 rounded-full blur-[100px] pointer-events-none" />

            {/* ── sparkles ── */}
            {sparkles.map((s, i) => (
                <Sparkle
                    key={i}
                    style={{
                        top: s.top,
                        left: s.left,
                        animation: `sparkle 3s ease-in-out ${s.animationDelay} infinite`,
                    }}
                />
            ))}

            {/* ── main content ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
                {/* rotating gears */}
                <div className="relative mb-8">
                    <div className="text-gold-400/60" style={{ animation: "spin-slow 8s linear infinite" }}>
                        <Gear size={56} />
                    </div>
                    <div
                        className="absolute -top-2 -right-5 text-gold-300/40"
                        style={{ animation: "spin-slow 8s linear infinite reverse" }}
                    >
                        <Gear size={32} />
                    </div>
                </div>

                {/* title */}
                <p className="text-xs sm:text-sm text-gold-600 font-medium tracking-[0.3em] uppercase mb-4 sm:mb-5">
                    Coming Soon
                </p>

                <h1
                    className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gold-gradient leading-tight mb-3 text-center"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    Under Construction
                </h1>

                <p className="text-base sm:text-lg text-gray-500 max-w-md text-center leading-relaxed mb-10 font-light">
                    We&apos;re crafting something{" "}
                    <span className="text-gold-600 font-medium italic">extraordinary</span> for you.
                    <br className="hidden sm:block" />
                    Our platform is being built with care — please check back soon.
                </p>

                {/* countdown */}
                <div className="flex items-center gap-4 sm:gap-8">
                    <CountdownUnit value={days} label="Days" />
                    <span className="text-gold-400/50 text-2xl sm:text-4xl font-light -mt-5">:</span>
                    <CountdownUnit value={hours} label="Hours" />
                    <span className="text-gold-400/50 text-2xl sm:text-4xl font-light -mt-5">:</span>
                    <CountdownUnit value={minutes} label="Mins" />
                    <span className="text-gold-400/50 text-2xl sm:text-4xl font-light -mt-5">:</span>
                    <CountdownUnit value={seconds} label="Secs" />
                </div>

                {/* progress bar */}
                <ProgressBar />

                {/* contact nudge */}
                <div className="mt-12 flex flex-col items-center gap-3">
                    <p className="text-xs text-gray-400 tracking-wide uppercase">Reach out in the meantime</p>
                    <a
                        href="mailto:work.astro.avii@gmail.com"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-gold-300/40 bg-white/60 backdrop-blur-md text-gold-700 text-sm font-medium transition-all duration-300 hover:border-gold-400 hover:shadow-lg hover:shadow-gold-200/30 hover:bg-white/80 active:scale-[0.98]"
                    >
                        <Mail className="w-4 h-4 text-gold-500 group-hover:text-gold-600 transition-colors" />
                        work.astro.avii@gmail.com
                    </a>
                </div>
            </main>

            {/* ── footer ── */}
            <footer className="relative z-10 py-6 border-t border-cream-300/50">
                <p className="text-center text-xs text-cream-600">
                    © {new Date().getFullYear()} Sanskar Dixit
                </p>
            </footer>

            {/* ── inline keyframes ── */}
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50%      { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}
