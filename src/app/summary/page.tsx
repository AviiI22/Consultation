"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import { PRICING } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    CheckCircle,
    Clock,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    CreditCard,
    Loader2,
} from "lucide-react";

export default function SummaryPage() {
    const router = useRouter();
    const { formData, setCurrentStep } = useBooking();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const amount = formData.duration ? PRICING[formData.duration] : 0;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        try {
            return format(new Date(dateStr), "EEEE, MMMM dd, yyyy");
        } catch {
            return dateStr;
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create booking");

            sessionStorage.setItem(
                "bookingInfo",
                JSON.stringify({
                    bookingId: data.id,
                    orderId: data.razorpayOrderId,
                    amount: data.amount,
                })
            );

            setCurrentStep(7);
            router.push("/payment");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const summaryItems = [
        {
            icon: <Star className="w-4 h-4" />,
            label: "Consultation Type",
            value: formData.consultationType === "urgent" ? "Urgent Consultation" : "Normal Consultation",
        },
        {
            icon: <CheckCircle className="w-4 h-4" />,
            label: "Birth Time Rectification",
            value: formData.btrOption === "with-btr" ? "With BTR" : "Without BTR",
        },
        {
            icon: <Clock className="w-4 h-4" />,
            label: "Duration",
            value: formData.duration === 60 ? "1 Hour" : "30 Minutes",
        },
        {
            icon: <Calendar className="w-4 h-4" />,
            label: "Date",
            value: formatDate(formData.consultationDate),
        },
        {
            icon: <Clock className="w-4 h-4" />,
            label: "Time Slot",
            value: formData.consultationTime || "—",
        },
        {
            icon: <User className="w-4 h-4" />,
            label: "Name",
            value: formData.name,
        },
        {
            icon: <Calendar className="w-4 h-4" />,
            label: "Date of Birth",
            value: formData.dob || "—",
        },
        {
            icon: <Clock className="w-4 h-4" />,
            label: "Time of Birth",
            value: formData.tob || "—",
        },
        {
            icon: <User className="w-4 h-4" />,
            label: "Gender",
            value: formData.gender || "—",
        },
        {
            icon: <Mail className="w-4 h-4" />,
            label: "Email",
            value: formData.email,
        },
        {
            icon: <Phone className="w-4 h-4" />,
            label: "Phone",
            value: formData.phone,
        },
        {
            icon: <MapPin className="w-4 h-4" />,
            label: "Place of Birth",
            value: formData.birthPlace,
        },
    ];

    return (
        <>
            <Stepper currentStep={6} />
            <StepCard
                title="Booking Summary"
                subtitle="Review your details before confirming"
            >
                <div className="space-y-6">
                    {/* Summary card */}
                    <div className="rounded-xl bg-cream-100 border border-cream-400/50 divide-y divide-cream-300/60">
                        {summaryItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <span className="text-gold-600">{item.icon}</span>
                                    {item.label}
                                </div>
                                <div className="text-gray-800 text-sm font-medium text-right max-w-[50%] truncate">
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Concern */}
                    {formData.concern && (
                        <div className="rounded-xl bg-cream-100 border border-cream-400/50 p-5">
                            <p className="text-gray-500 text-sm mb-2">Your Concern</p>
                            <p className="text-gray-700 text-sm leading-relaxed">{formData.concern}</p>
                        </div>
                    )}

                    {/* Price */}
                    <div className="rounded-xl bg-white border border-cream-400/60 p-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600 font-medium">Total Amount</span>
                        </div>
                        <span className="text-2xl font-serif font-bold text-gray-800">
                            ₹{amount.toLocaleString("en-IN")}
                        </span>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Confirm */}
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2",
                            loading
                                ? "bg-gold-300 text-white cursor-wait"
                                : "bg-gold-500 hover:bg-gold-400 text-white hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Booking...
                            </>
                        ) : (
                            "Confirm Appointment"
                        )}
                    </button>
                </div>
            </StepCard>
        </>
    );
}
