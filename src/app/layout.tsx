import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/context/BookingContext";

export const metadata: Metadata = {
    title: "Astrology Consultation | Expert Vedic Readings & Personalized Guidance",
    description:
        "Book a premium astrology consultation session. Get deep insights into your life, career, and relationships from expert Vedic astrologers. Accurate Birth Time Rectification available.",
    keywords: "vedic astrology, birth chart analysis, birth time rectification, horoscope predictions, career astrology, relationship guidance",
    openGraph: {
        title: "Astrology Consultation | Expert Vedic Readings",
        description: "Discover your cosmic path with personalized Vedic astrology consultations.",
        type: "website",
        locale: "en_IN",
        siteName: "Astrology Consultation",
    },
    twitter: {
        card: "summary_large_image",
        title: "Astrology Consultation",
        description: "Expert Vedic astrology insights for your life journey.",
    },
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#FDFCF8' },
        { media: '(prefers-color-scheme: dark)', color: '#020617' },
    ],
};

import { ThemeProvider } from "next-themes";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-cream-100 dark:bg-slate-950 antialiased">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                    <BookingProvider>
                        {children}
                    </BookingProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
