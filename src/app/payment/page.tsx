"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import { Loader2, CreditCard } from "lucide-react";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: Record<string, string>;
    theme: { color: string };
    modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
    open: () => void;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export default function PaymentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingInfo, setBookingInfo] = useState<{
        bookingId: string;
        orderId: string;
        amount: number;
    } | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("bookingInfo");
        if (!stored) {
            setError("No booking information found. Please start over.");
            setLoading(false);
            return;
        }

        const info = JSON.parse(stored);
        setBookingInfo(info);

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
            setLoading(false);
        };
        script.onerror = () => {
            setError("Failed to load payment gateway. Please try again.");
            setLoading(false);
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handlePayment = () => {
        if (!bookingInfo || !window.Razorpay) return;

        const options: RazorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
            amount: bookingInfo.amount * 100,
            currency: "INR",
            name: "Astrology Consultation",
            description: "Consultation Booking Payment",
            order_id: bookingInfo.orderId,
            handler: async (response: RazorpayResponse) => {
                try {
                    const res = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            bookingId: bookingInfo.bookingId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        sessionStorage.setItem(
                            "confirmationInfo",
                            JSON.stringify({
                                bookingId: bookingInfo.bookingId,
                                amount: bookingInfo.amount,
                            })
                        );
                        sessionStorage.removeItem("bookingInfo");
                        router.push("/confirmation");
                    } else {
                        setError("Payment verification failed. Please contact support.");
                    }
                } catch {
                    setError("Failed to verify payment. Please contact support.");
                }
            },
            prefill: {},
            theme: { color: "#C9A227" },
            modal: {
                ondismiss: () => {
                    setError("Payment was cancelled. You can try again.");
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <>
            <Stepper currentStep={7} />
            <StepCard
                title="Complete Payment"
                subtitle="Secure payment powered by Razorpay"
            >
                <div className="space-y-6 text-center">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                            <p className="text-gray-500">Loading payment gateway...</p>
                        </div>
                    ) : error ? (
                        <div className="py-8 space-y-4">
                            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
                                {error}
                            </div>
                            <button
                                onClick={() => router.push("/")}
                                className="text-gold-600 hover:text-gold-500 text-sm underline underline-offset-4"
                            >
                                Start Over
                            </button>
                        </div>
                    ) : (
                        <div className="py-8 space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-cream-200 border-2 border-cream-400/60 flex items-center justify-center">
                                <CreditCard className="w-10 h-10 text-gray-600" />
                            </div>

                            {bookingInfo && (
                                <div className="rounded-xl bg-white border border-cream-400/60 p-5">
                                    <p className="text-gray-500 text-sm mb-1">Amount to Pay</p>
                                    <p className="text-3xl font-serif font-bold text-gray-800">
                                        ₹{bookingInfo.amount.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-2">
                                        Booking ID: {bookingInfo.bookingId.slice(0, 8)}...
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                className="w-full py-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                Pay Now with Razorpay
                            </button>

                            <p className="text-gray-400 text-xs">
                                🔒 Your payment is secured by Razorpay&apos;s 256-bit encryption
                            </p>
                        </div>
                    )}
                </div>
            </StepCard>
        </>
    );
}
