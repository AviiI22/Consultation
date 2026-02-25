"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import BookingLayout from "@/components/BookingLayout";
import { Loader2, CreditCard } from "lucide-react";

declare global {
    interface Window {
        Cashfree: (config: { mode: string }) => CashfreeInstance;
    }
}

interface CashfreeInstance {
    checkout: (options: { paymentSessionId: string; returnUrl?: string }) => Promise<CashfreeCheckoutResult>;
}

interface CashfreeCheckoutResult {
    error?: { message: string };
    redirect?: boolean;
}

import { useBooking } from "@/context/BookingContext";
import { formatPrice } from "@/lib/pricing";

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currency } = useBooking();
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [bookingInfo, setBookingInfo] = useState<{
        bookingId: string;
        orderId: string;
        amount: number;
        paymentSessionId: string;
    } | null>(null);

    const verifyPayment = useCallback(async (bookingId: string, orderId: string, amount: number) => {
        setVerifying(true);
        try {
            const res = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, orderId }),
            });
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem(
                    "confirmationInfo",
                    JSON.stringify({
                        bookingId,
                        amount: amount,
                    })
                );
                sessionStorage.removeItem("bookingInfo");
                router.push("/confirmation");
            } else {
                setError("Payment verification failed. Please contact support.");
                setVerifying(false);
            }
        } catch {
            setError("Failed to verify payment. Please contact support.");
            setVerifying(false);
        }
    }, [router]);

    useEffect(() => {
        const stored = sessionStorage.getItem("bookingInfo");
        if (!stored) {
            setError("No booking information found. Please start over.");
            setLoading(false);
            return;
        }

        const info = JSON.parse(stored);

        // Use a functional update to avoid dependency on bookingInfo state
        setBookingInfo(prev => {
            // Only update if the data is different to prevent cycles
            if (prev?.bookingId === info.bookingId && prev?.paymentSessionId === info.paymentSessionId) {
                return prev;
            }
            return info;
        });

        // Check if returning from Cashfree redirect
        const returnOrderId = searchParams.get("order_id");
        if (returnOrderId) {
            setLoading(false);
            verifyPayment(info.bookingId, returnOrderId, info.amount);
            return;
        }

        // Load Cashfree JS SDK if not returning from redirect
        if (!window.Cashfree) {
            const script = document.createElement("script");
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
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
        } else {
            setLoading(false);
        }
    }, [searchParams, verifyPayment]); // verifyPayment is now stable because it only depends on router

    const handlePayment = async () => {
        if (!bookingInfo || !window.Cashfree) return;

        try {
            console.log("bookingInfo for checkout:", JSON.stringify(bookingInfo));

            if (!bookingInfo.paymentSessionId) {
                setError("Payment session expired. Please go back and try again.");
                return;
            }

            const cashfree = window.Cashfree({ mode: "production" });

            const checkoutOptions = {
                paymentSessionId: bookingInfo.paymentSessionId,
                returnUrl: `${window.location.origin}/payment?order_id=${bookingInfo.orderId}`,
            };

            const result = await cashfree.checkout(checkoutOptions);

            if (result.error) {
                setError(result.error.message || "Payment was cancelled. You can try again.");
            }
            if (result.redirect) {
                // User will be redirected to returnUrl after payment
                console.log("Redirecting to payment gateway...");
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError("Payment failed. Please try again.");
        }
    };

    return (
        <BookingLayout>
            <Stepper currentStep={7} />
            <StepCard
                title="Complete Payment"
                subtitle="Secure payment powered by Cashfree"
            >
                <div className="space-y-6 text-center">
                    {loading || verifying ? (
                        <div className="py-12 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                            <p className="text-gray-500">
                                {verifying ? "Verifying payment..." : "Loading payment gateway..."}
                            </p>
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
                                        {formatPrice(bookingInfo.amount, currency)}
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
                                Pay Now
                            </button>

                            <p className="text-gray-400 text-xs">
                                🔒 Your payment is secured by Cashfree&apos;s 256-bit encryption
                            </p>
                        </div>
                    )}
                </div>
            </StepCard>
        </BookingLayout>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <BookingLayout>
                <Stepper currentStep={7} />
                <StepCard title="Complete Payment" subtitle="Loading...">
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                        <p className="text-gray-500">Loading payment gateway...</p>
                    </div>
                </StepCard>
            </BookingLayout>
        }>
            <PaymentContent />
        </Suspense>
    );
}
