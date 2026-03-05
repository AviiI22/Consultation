"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import BookingLayout from "@/components/BookingLayout";
import { CheckCircle, Calendar, Clock, Sparkles, Download, Video, CalendarPlus, Timer } from "lucide-react";
import { generateReceiptPDF } from "@/lib/generate-receipt";

function useCountdown(consultationDate: string | null, consultationTime: string | null, timezone: string) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        if (!consultationDate || !consultationTime) return;
        const timePart = consultationTime.split(" - ")[0].trim();
        const match = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return;

        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === "AM" && h === 12) h = 0;
        if (period === "PM" && h !== 12) h += 12;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const localStr = `${consultationDate}T${hh}:${mm}:00`;

        const tick = () => {
            const nowMs = Date.now();
            // Get now in user's timezone to compare properly
            const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: timezone || "Asia/Kolkata" }));
            const sessionInTz = new Date(localStr); // treated as local
            const diff = sessionInTz.getTime() - nowInTz.getTime();
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft({ days, hours, minutes, seconds });
            void nowMs; // suppress lint
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [consultationDate, consultationTime, timezone]);

    return timeLeft;
}

function buildGoogleCalendarUrl(
    date: string,
    time: string,
    durationMinutes: number,
    meetLink: string | null
) {
    const timePart = time.split(" - ")[0].trim();
    const match = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "AM" && h === 12) h = 0;
    if (period === "PM" && h !== 12) h += 12;

    // Build local datetimes for start and end
    const startDate = new Date(date);
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const fmt = (d: Date) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const details = meetLink
        ? `Astrology Consultation with Sanskar Dixit\n\nJoin via Google Meet: ${meetLink}`
        : "Astrology Consultation with Sanskar Dixit";

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: "Astrology Consultation — Sanskar Dixit",
        dates: `${fmt(startDate)}/${fmt(endDate)}`,
        details,
        location: meetLink || "Google Meet",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ConfirmationPage() {
    const router = useRouter();
    const { formData, resetFormData } = useBooking();
    const [confirmationInfo, setConfirmationInfo] = useState<{
        bookingId: string;
        amount: number;
        currency: string;
        meetingLink?: string | null;
    } | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("confirmationInfo");
        if (stored) {
            setConfirmationInfo(JSON.parse(stored));
        }
    }, []);

    const timezone = (formData as { userTimezone?: string }).userTimezone || "Asia/Kolkata";
    const timeLeft = useCountdown(formData.consultationDate, formData.consultationTime, timezone);

    const handleNewBooking = () => {
        sessionStorage.removeItem("confirmationInfo");
        resetFormData();
        router.push("/");
    };

    const downloadReceipt = () => {
        if (!confirmationInfo) return;
        generateReceiptPDF({
            bookingId: confirmationInfo.bookingId,
            name: formData.name,
            email: formData.email,
            consultationType: formData.consultationType === "urgent" ? "Urgent Consultation" : "Normal Consultation",
            date: formData.consultationDate || "—",
            time: formData.consultationTime || "—",
            amount: confirmationInfo.amount,
            currency: confirmationInfo.currency || "INR",
        });
    };

    const calendarUrl = (formData.consultationDate && formData.consultationTime)
        ? buildGoogleCalendarUrl(
            formData.consultationDate,
            formData.consultationTime,
            formData.duration || 40,
            confirmationInfo?.meetingLink || null
        )
        : null;

    const sessionPassed = timeLeft && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

    return (
        <BookingLayout>
            <Stepper currentStep={7} />
            <StepCard title="Booking Confirmed!" subtitle="Your consultation has been successfully booked">
                <div className="space-y-8 text-center">
                    {/* Success animation */}
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping" />
                        <div className="relative w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-serif text-gray-800 mb-2">Thank You!</h3>
                        <p className="text-gray-500 text-sm">
                            Your astrology consultation has been booked successfully.
                        </p>
                    </div>

                    {/* Countdown Timer */}
                    {timeLeft && !sessionPassed && (
                        <div className="rounded-xl bg-gradient-to-br from-gold-50 to-cream-100 border border-gold-200 p-5">
                            <p className="text-xs text-gold-600 font-semibold uppercase tracking-widest flex items-center justify-center gap-1 mb-3">
                                <Timer className="w-3.5 h-3.5" /> Session starts in
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                {[
                                    { value: timeLeft.days, label: "Days" },
                                    { value: timeLeft.hours, label: "Hours" },
                                    { value: timeLeft.minutes, label: "Min" },
                                    { value: timeLeft.seconds, label: "Sec" },
                                ].map(({ value, label }) => (
                                    <div key={label} className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-xl bg-white border-2 border-gold-200 flex items-center justify-center shadow-sm">
                                            <span className="text-2xl font-bold text-gray-800 font-mono tabular-nums">
                                                {String(value).padStart(2, "0")}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gold-600 mt-1 font-medium uppercase tracking-wider">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {timeLeft && sessionPassed && (
                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 text-sm font-medium">
                            🎯 Your session time has arrived!
                        </div>
                    )}

                    {/* Google Meet Link */}
                    {confirmationInfo?.meetingLink && (
                        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-left">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" /> Your Google Meet Link
                            </p>
                            <a
                                href={confirmationInfo.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-700 underline underline-offset-2 break-all hover:text-blue-500 transition-colors"
                            >
                                {confirmationInfo.meetingLink}
                            </a>
                            <p className="text-xs text-blue-400 mt-1">Click at your scheduled time to join the session</p>
                        </div>
                    )}

                    {/* Booking details */}
                    <div className="rounded-xl bg-cream-100 border border-cream-400/50 p-6 space-y-4 text-left">
                        {confirmationInfo && (
                            <div className="pb-3 border-b border-cream-300/60">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-gray-500 text-sm">Booking ID</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(confirmationInfo.bookingId)}
                                        className="text-xs text-gold-600 hover:text-gold-500 underline underline-offset-2 transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <span className="text-gold-700 font-mono text-xs break-all select-all">
                                    {confirmationInfo.bookingId}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-0.5">Save this — you'll need it for Manage Booking</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4 text-gold-600" />
                                Date
                            </span>
                            <span className="text-gray-800 text-sm">{formData.consultationDate || "—"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-gray-500 text-sm">
                                <Clock className="w-4 h-4 text-gold-600" />
                                Time
                            </span>
                            <span className="text-gray-800 text-sm">{formData.consultationTime || "—"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-gray-500 text-sm">
                                <Sparkles className="w-4 h-4 text-gold-600" />
                                Duration
                            </span>
                            <span className="text-gray-800 text-sm">
                                {formData.duration === 90 ? "1 Hour 30 Minutes" : "40 Minutes"}
                            </span>
                        </div>

                        {confirmationInfo && (
                            <div className="flex items-center justify-between pt-3 border-t border-cream-300/60">
                                <span className="text-gray-500 text-sm">Amount Paid</span>
                                <span className="text-green-600 font-semibold">
                                    {confirmationInfo.currency || "INR"} {confirmationInfo.amount.toLocaleString("en-IN")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Payment status */}
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium text-sm">Payment Successful</span>
                    </div>

                    <p className="text-gray-400 text-xs">
                        A confirmation email has been sent to you. Our astrologer will connect
                        with you at the scheduled time.
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={downloadReceipt}
                            className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Receipt
                        </button>
                        {calendarUrl && (
                            <a
                                href={calendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <CalendarPlus className="w-4 h-4" />
                                Add to Calendar
                            </a>
                        )}
                        <button
                            onClick={handleNewBooking}
                            className="w-full sm:col-span-2 py-3 rounded-xl border-2 border-gold-300 text-gold-700 hover:bg-gold-50 font-medium transition-all duration-300"
                        >
                            Book Another
                        </button>
                    </div>
                </div>
            </StepCard>
        </BookingLayout>
    );
}
