import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/context/BookingContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
    title: "Sanskar Dixit | Experience True Jyotish — Vedic Astrology Consultation",
    description:
        "Book a personalized Vedic astrology consultation with Sanskar Dixit. Get authentic insights into your life, career, and relationships through true Jyotish Shastra.",
    keywords: "sanskar dixit, vedic astrology, jyotish, birth chart analysis, birth time rectification, horoscope predictions, astrology consultation",
    openGraph: {
        title: "Sanskar Dixit | Experience True Jyotish",
        description: "Authentic Vedic astrology consultations with Sanskar Dixit. Experience true Jyotish.",
        type: "website",
        locale: "en_IN",
        siteName: "Sanskar Dixit — Vedic Astrology",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sanskar Dixit | Experience True Jyotish",
        description: "Authentic Vedic astrology consultations. Experience true Jyotish.",
    },
    themeColor: '#FDFCF8',
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-cream-100 antialiased">
                <BookingProvider>
                    {children}
                </BookingProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
