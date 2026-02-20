import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/context/BookingContext";

export const metadata: Metadata = {
    title: "Astrology Consultation | Book Your Session",
    description:
        "Book a premium astrology consultation session. Get personalized insights about your life, career, relationships, and more from expert astrologers.",
    keywords: "astrology, consultation, horoscope, birth chart, vedic astrology",
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
            </body>
        </html>
    );
}
