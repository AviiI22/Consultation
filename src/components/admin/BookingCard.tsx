"use client";

import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    CheckCircle2,
    XCircle,
    StickyNote,
    Link2,
    Send,
    Loader2,
    Video,
} from "lucide-react";

interface Booking {
    id: string;
    consultationType: string;
    btrOption: string;
    duration: number;
    consultationDate: string;
    consultationTime: string;
    name: string;
    dob: string;
    tob: string;
    gender: string;
    email: string;
    phone: string;
    birthPlace: string;
    concern: string;
    amount: number;
    paymentStatus: string;
    status: string;
    meetingLink: string | null;
    adminNotes: string | null;
    promoCode: string | null;
    discountAmount: number;
    userTimezone: string;
    adminTimezone: string;
    currency: string;
    createdAt: string;
    utmSource: string | null;
    refundStatus: string | null;
}

interface BookingCardProps {
    booking: Booking;
    dim?: boolean;
    actionLoading: string | null;
    googleConnected: boolean | null;
    onUpdateBooking: (id: string, data: Record<string, unknown>) => void;
    onSendFollowUp: (id: string) => void;
    onGenerateMeet: (id: string, notify: boolean) => void;
    onOpenNotes: (id: string, current: string) => void;
    onOpenMeetLink: (id: string, current: string) => void;
}

function statusColor(s: string) {
    if (s === "Completed") return "bg-green-100 text-green-700 border-green-200";
    if (s === "Cancelled") return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
}

export function BookingCard({
    booking: b,
    dim = false,
    actionLoading,
    googleConnected,
    onUpdateBooking,
    onSendFollowUp,
    onGenerateMeet,
    onOpenNotes,
    onOpenMeetLink,
}: BookingCardProps) {
    return (
        <div
            className={`rounded-xl border p-5 space-y-3 transition-all ${dim ? "opacity-60 bg-cream-50 border-cream-300" : "bg-white border-cream-400/50 shadow-sm"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-600" />
                    <span className="font-semibold text-gray-800">{b.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(b.status)}`}>
                        {b.status}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-gold-600 font-bold">{b.currency || 'INR'} {b.amount.toLocaleString("en-IN")}</span>
                    {b.promoCode && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                            {b.promoCode} (-{b.currency || 'INR'} {b.discountAmount})
                        </span>
                    )}
                </div>
            </div>

            {/* Booking ID */}
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-cream-50 p-2 rounded-lg border border-cream-200">
                <strong className="text-gray-600">Booking ID:</strong>
                <span className="font-mono text-[10px] sm:text-xs select-all text-gold-700">{b.id}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(b.id);
                    }}
                    className="ml-auto text-gold-600 hover:text-gold-500 underline underline-offset-2 transition-colors shrink-0"
                >
                    Copy
                </button>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 mt-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gold-500" />{b.consultationDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold-500" />{b.consultationTime}</span>
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-gold-500" />{b.duration} min • {b.consultationType}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gold-500" />{b.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gold-500" />{b.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-500" />{b.birthPlace}</span>
                <span className="flex items-center gap-1 text-gray-500">DOB: {b.dob}</span>
                <span className="flex items-center gap-1 text-gray-500">TOB: {b.tob}</span>
                <span className="flex items-center gap-1 text-gray-500">Gender: {b.gender}</span>
                <span className="flex items-center gap-1 text-gray-500 font-medium col-span-2 sm:col-span-3 bg-gold-50/50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3 text-gold-600" />
                    Booked On: {new Date(b.createdAt).toLocaleString("en-IN", {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    })}
                </span>
            </div>

            {/* Concern */}
            {b.concern && (
                <div className="text-xs text-gray-500 bg-cream-50 rounded-lg p-2 border border-cream-200">
                    <strong className="text-gray-600">Concern:</strong> {b.concern}
                </div>
            )}

            {/* Notes / Meeting Link */}
            {b.adminNotes && (
                <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                    <strong>📝 Notes:</strong> {b.adminNotes}
                </div>
            )}
            {/* Meet Link */}
            {b.meetingLink ? (
                <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2 border border-blue-200 flex items-center gap-2">
                    <Video className="w-3 h-3 flex-shrink-0" />
                    <strong>Google Meet:</strong>{" "}
                    <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="underline truncate">
                        {b.meetingLink}
                    </a>
                </div>
            ) : (
                b.paymentStatus === "Paid" && googleConnected && (
                    <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                        <span className="font-medium">⚠️ No meeting link yet.</span>{" "}
                        Click &ldquo;Generate Meet&rdquo; below to create one.
                    </div>
                )
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-200">
                {b.status === "Upcoming" && (
                    <>
                        <button
                            onClick={() => onUpdateBooking(b.id, { status: "Completed" })}
                            disabled={actionLoading === b.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                        <button
                            onClick={() => onUpdateBooking(b.id, { status: "Cancelled" })}
                            disabled={actionLoading === b.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-3 h-3" /> Cancel
                        </button>
                    </>
                )}
                <button
                    onClick={() => onOpenNotes(b.id, b.adminNotes || "")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                    <StickyNote className="w-3 h-3" /> Notes
                </button>
                <button
                    onClick={() => onOpenMeetLink(b.id, b.meetingLink || "")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                    <Link2 className="w-3 h-3" /> Meeting Link
                </button>
                {/* Generate Meet button */}
                {b.paymentStatus === "Paid" && googleConnected && (
                    <button
                        onClick={() => onGenerateMeet(b.id, true)}
                        disabled={actionLoading === `meet-${b.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                        {actionLoading === `meet-${b.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Video className="w-3 h-3" />
                        )}
                        {b.meetingLink ? "Regenerate Meet" : "Generate Meet"}
                    </button>
                )}
                {b.status === "Completed" && (
                    <button
                        onClick={() => onSendFollowUp(b.id)}
                        disabled={actionLoading === `followup-${b.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <Send className="w-3 h-3" />
                        {actionLoading === `followup-${b.id}` ? "Sending..." : "Follow-Up"}
                    </button>
                )}
            </div>
        </div>
    );
}

export type { Booking };
