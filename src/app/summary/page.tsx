"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import BookingLayout from "@/components/BookingLayout";
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
    Tag,
    X,
} from "lucide-react";

export default function SummaryPage() {
    const router = useRouter();
    const { formData, updateFormData, setCurrentStep } = useBooking();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Promo code state
    const [promoInput, setPromoInput] = useState(formData.promoCode || "");
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [promoApplied, setPromoApplied] = useState(!!formData.promoCode);

    const baseAmount = formData.duration ? PRICING[formData.duration] : 0;
    const discountPercent = formData.discountPercent || 0;
    const discountAmount = Math.round((baseAmount * discountPercent) / 100);
    const finalAmount = Math.max(baseAmount - discountAmount, 1);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        try {
            return format(new Date(dateStr), "EEEE, MMMM dd, yyyy");
        } catch {
            return dateStr;
        }
    };

    const applyPromo = async () => {
        if (!promoInput.trim()) return;
        setPromoLoading(true);
        setPromoError("");
        try {
            const res = await fetch("/api/promo/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: promoInput.trim().toUpperCase() }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                updateFormData({
                    promoCode: data.code,
                    discountPercent: data.discountPercent,
                });
                setPromoApplied(true);
            } else {
                setPromoError(data.error || "Invalid promo code");
            }
        } catch {
            setPromoError("Failed to validate promo code");
        } finally {
            setPromoLoading(false);
        }
    };

    const removePromo = () => {
        updateFormData({ promoCode: null, discountPercent: 0 });
        setPromoApplied(false);
        setPromoInput("");
        setPromoError("");
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
                    amount: baseAmount,
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
        <BookingLayout>
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

                    {/* Promo Code */}
                    <div className="rounded-xl bg-white border border-cream-400/50 p-4">
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gold-600" /> Promo Code
                        </p>
                        {promoApplied ? (
                            <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2.5 border border-green-200">
                                <div>
                                    <span className="font-mono font-bold text-green-700">{formData.promoCode}</span>
                                    <span className="ml-2 text-sm text-green-600">(-{discountPercent}%)</span>
                                </div>
                                <button onClick={removePromo} className="text-green-500 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                    placeholder="Enter promo code"
                                    className="flex-1 px-3 py-2 rounded-lg bg-cream-50 border border-cream-400/60 text-sm uppercase focus:outline-none focus:border-gold-500"
                                />
                                <button
                                    onClick={applyPromo}
                                    disabled={promoLoading || !promoInput.trim()}
                                    className="px-4 py-2 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-50"
                                >
                                    {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                </button>
                            </div>
                        )}
                        {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                    </div>

                    {/* Price */}
                    <div className="rounded-xl bg-white border border-cream-400/60 p-5">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-600 font-medium">Subtotal</span>
                            </div>
                            <span className="text-gray-600">₹{baseAmount.toLocaleString("en-IN")}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex items-center justify-between mb-1 text-green-600 text-sm">
                                <span>Discount ({discountPercent}%)</span>
                                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                            </div>
                        )}
                        <div className="border-t border-cream-300/60 pt-2 mt-2 flex items-center justify-between">
                            <span className="text-gray-800 font-semibold">Total</span>
                            <span className="text-2xl font-serif font-bold text-gray-800">
                                ₹{finalAmount.toLocaleString("en-IN")}
                            </span>
                        </div>
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
        </BookingLayout>
    );
}
