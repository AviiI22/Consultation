"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, Clock, Video, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface BookingInfo {
    id: string;
    consultationType: string;
    btrOption: string;
    duration: number;
    consultationDate: string;
    consultationTime: string;
    name: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    status: string;
    meetingLink: string | null;
    userTimezone: string;
    createdAt: string;
}

export default function ManageBookingPage() {
    const [bookingId, setBookingId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [booking, setBooking] = useState<BookingInfo | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelMsg, setCancelMsg] = useState("");
    const [cancelError, setCancelError] = useState("");

    const handleLookup = async () => {
        if (!bookingId.trim() || !email.trim()) return;
        setLoading(true);
        setError("");
        setBooking(null);
        setCancelMsg("");
        try {
            const res = await fetch(`/api/booking-lookup?bookingId=${encodeURIComponent(bookingId.trim())}&email=${encodeURIComponent(email.trim())}`);
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Not found"); return; }
            setBooking(data.booking);
        } catch {
            setError("Failed to fetch booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!booking) return;
        if (!confirm("Are you sure you want to cancel this booking? A refund request will be raised automatically.")) return;
        setCancelling(true);
        setCancelError("");
        try {
            const res = await fetch("/api/booking-lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: booking.id, email: booking.email, action: "cancel" }),
            });
            const data = await res.json();
            if (res.ok) {
                setCancelMsg(data.message);
                setBooking({ ...booking, status: "Cancelled" });
            } else {
                setCancelError(data.error || "Cancellation failed.");
            }
        } catch {
            setCancelError("Error. Please contact support.");
        } finally {
            setCancelling(false);
        }
    };

    const statusColor = (s: string) => {
        if (s === "Completed") return "bg-green-100 text-green-700";
        if (s === "Cancelled") return "bg-red-100 text-red-700";
        return "bg-blue-100 text-blue-700";
    };

    return (
        <div className="min-h-screen bg-cream-100">
            <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-300/50">
                <div className="max-w-xl mx-auto px-4 h-auto min-h-14 flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:py-0">
                    <Link href="/" className="font-serif text-lg text-gold-gradient tracking-wide">✦ Astrology Consultation</Link>
                    <Link href="/book" className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-all text-center">Book Now</Link>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-8">
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-cream-600 hover:text-gold-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Manage Booking</h1>
                <p className="text-gray-500 text-sm mb-8">Enter your Booking ID and email to view or cancel your booking.</p>

                {/* Lookup Form */}
                <div className="bg-white rounded-2xl border border-cream-400/50 p-6 shadow-sm space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Booking ID</label>
                        <input
                            type="text"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="e.g. a1b2c3d4-..."
                            className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                        />
                    </div>
                    <button
                        onClick={handleLookup}
                        disabled={loading || !bookingId.trim() || !email.trim()}
                        className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Find Booking
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>

                {/* Booking Details */}
                {booking && (
                    <div className="bg-white rounded-2xl border border-cream-400/50 p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-serif text-lg text-gray-800">Booking Details</h2>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gold-500" />Date</span>
                                <span className="font-medium text-gray-800">{booking.consultationDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold-500" />Time</span>
                                <span className="font-medium text-gray-800">{booking.consultationTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium text-gray-800">{booking.consultationType === "urgent" ? "Urgent" : "Normal"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Duration</span>
                                <span className="font-medium text-gray-800">{booking.duration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-semibold text-gold-600">{booking.currency} {booking.amount.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        {booking.meetingLink && (
                            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                                <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1"><Video className="w-3.5 h-3.5" />Google Meet Link</p>
                                <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline break-all">
                                    {booking.meetingLink}
                                </a>
                            </div>
                        )}

                        {cancelMsg && (
                            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-2 text-green-700 text-sm">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{cancelMsg}
                            </div>
                        )}

                        {booking.status === "Upcoming" && booking.paymentStatus === "Paid" && !cancelMsg && (
                            <div className="border-t border-cream-200 pt-4">
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">Cancellations must be made at least <strong>24 hours</strong> before the session. A refund will be initiated automatically.</p>
                                </div>
                                {cancelError && <p className="text-red-500 text-sm mb-2">{cancelError}</p>}
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full py-2.5 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Cancel Booking
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
