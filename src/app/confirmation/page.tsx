"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import { CheckCircle, Calendar, Clock, Sparkles } from "lucide-react";

export default function ConfirmationPage() {
    const router = useRouter();
    const { formData, resetFormData } = useBooking();
    const [confirmationInfo, setConfirmationInfo] = useState<{
        bookingId: string;
        amount: number;
    } | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("confirmationInfo");
        if (stored) {
            setConfirmationInfo(JSON.parse(stored));
        }
    }, []);

    const handleNewBooking = () => {
        sessionStorage.removeItem("confirmationInfo");
        resetFormData();
        router.push("/");
    };

    return (
        <div className="pt-8">
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

                    {/* Booking details */}
                    <div className="rounded-xl bg-cream-100 border border-cream-400/50 p-6 space-y-4 text-left">
                        {confirmationInfo && (
                            <div className="flex items-center justify-between pb-3 border-b border-cream-300/60">
                                <span className="text-gray-500 text-sm">Booking ID</span>
                                <span className="text-gold-700 font-mono text-sm">
                                    {confirmationInfo.bookingId.slice(0, 12)}...
                                </span>
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
                                {formData.duration === 60 ? "1 Hour" : "30 Minutes"}
                            </span>
                        </div>

                        {confirmationInfo && (
                            <div className="flex items-center justify-between pt-3 border-t border-cream-300/60">
                                <span className="text-gray-500 text-sm">Amount Paid</span>
                                <span className="text-green-600 font-semibold">
                                    ₹{confirmationInfo.amount.toLocaleString("en-IN")}
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
                        A confirmation will be sent to your email. Our astrologer will connect
                        with you at the scheduled time.
                    </p>

                    <button
                        onClick={handleNewBooking}
                        className="w-full py-3 rounded-xl border-2 border-gold-300 text-gold-700 hover:bg-gold-50 font-medium transition-all duration-300"
                    >
                        Book Another Consultation
                    </button>
                </div>
            </StepCard>
        </div>
    );
}
