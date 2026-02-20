import Link from "next/link";

export default function BookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-cream-100 bg-stars">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-100/20 rounded-full blur-3xl" />
            </div>

            <main className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="py-6 px-4 text-center">
                    <Link href="/" className="font-serif text-2xl sm:text-3xl text-gold-gradient tracking-wide">
                        ✦ Astrology Consultation ✦
                    </Link>
                    <p className="text-cream-700 text-xs mt-1 tracking-widest uppercase">
                        Discover Your Cosmic Path
                    </p>
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center px-4 pb-8">
                    {children}
                </div>

                {/* Footer */}
                <footer className="py-4 text-center text-cream-700 text-xs border-t border-cream-400/50">
                    <p>© 2026 Astrology Consultation. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}
