"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    Search,
    Loader2,
    Users,
    Download,
    Megaphone,
    Box,
    LayoutDashboard,
    Sparkles,
} from "lucide-react";

interface ServicePackage {
    id: string;
    name: string;
    description: string;
    sessionCount: number;
    price: number;
    isActive: boolean;
}

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
}

interface ClientData {
    name: string;
    email: string;
    phone: string;
    dob: string;
    tob: string;
    gender: string;
    birthPlace: string;
    bookingCount: number;
    totalSpent: number;
    lastBooking: string;
    userTimezone: string;
}

function deriveClients(bookings: Booking[]): ClientData[] {
    const map = new Map<string, ClientData>();
    for (const b of bookings) {
        const existing = map.get(b.email);
        if (existing) {
            existing.bookingCount++;
            if (b.paymentStatus === "Paid") existing.totalSpent += b.amount;
            if (b.consultationDate > existing.lastBooking) {
                existing.lastBooking = b.consultationDate;
                existing.name = b.name;
                existing.phone = b.phone;
                existing.dob = b.dob;
                existing.tob = b.tob;
                existing.gender = b.gender;
                existing.birthPlace = b.birthPlace;
                existing.userTimezone = b.userTimezone || "UTC";
            }
        } else {
            map.set(b.email, {
                name: b.name,
                email: b.email,
                phone: b.phone,
                dob: b.dob,
                tob: b.tob,
                gender: b.gender,
                birthPlace: b.birthPlace,
                bookingCount: 1,
                totalSpent: b.paymentStatus === "Paid" ? b.amount : 0,
                lastBooking: b.consultationDate,
                userTimezone: b.userTimezone || "UTC",
            });
        }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"bookings" | "clients" | "packages">("bookings");
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [packageModal, setPackageModal] = useState(false);
    const [pkgName, setPkgName] = useState("");
    const [pkgDesc, setPkgDesc] = useState("");
    const [pkgSessions, setPkgSessions] = useState("");
    const [pkgPrice, setPkgPrice] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [noteModal, setNoteModal] = useState<{ id: string; current: string } | null>(null);
    const [linkModal, setLinkModal] = useState<{ id: string; current: string } | null>(null);
    const [noteText, setNoteText] = useState("");
    const [linkText, setLinkText] = useState("");
    const [announceModal, setAnnounceModal] = useState(false);
    const [announceSubject, setAnnounceSubject] = useState("");
    const [announceMessage, setAnnounceMessage] = useState("");

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/admin/bookings");
            const data = await res.json();
            setBookings(data.bookings || []);
        } catch {
            console.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await fetch("/api/admin/packages");
            const data = await res.json();
            setPackages(data.packages || []);
        } catch {
            console.error("Failed to fetch packages");
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchPackages();
    }, []);

    const updateBooking = async (id: string, data: Record<string, unknown>) => {
        setActionLoading(id);
        try {
            await fetch(`/api/admin/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            await fetchBookings();
        } catch {
            console.error("Failed to update");
        } finally {
            setActionLoading(null);
        }
    };

    const sendFollowUp = async (id: string) => {
        setActionLoading(`followup-${id}`);
        try {
            const res = await fetch("/api/admin/follow-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: id }),
            });
            if (res.ok) {
                alert("Follow-up email sent!");
            } else {
                alert("Failed to send follow-up email.");
            }
        } catch {
            alert("Error sending follow-up.");
        } finally {
            setActionLoading(null);
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const paid = bookings.filter((b) => b.paymentStatus === "Paid");
    const upcoming = paid.filter((b) => b.consultationDate >= today && b.status === "Upcoming");
    const completed = paid.filter((b) => b.status === "Completed");
    const cancelled = paid.filter((b) => b.status === "Cancelled");
    const past = paid.filter((b) => b.consultationDate < today && b.status === "Upcoming");

    const totalRevenue = paid.reduce((s, b) => s + b.amount, 0);

    const clients = deriveClients(bookings);
    const filteredClients = clients.filter(
        (c) =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.phone.includes(clientSearch)
    );

    const statusColor = (s: string) => {
        if (s === "Completed") return "bg-green-100 text-green-700 border-green-200";
        if (s === "Cancelled") return "bg-red-100 text-red-700 border-red-200";
        return "bg-blue-100 text-blue-700 border-blue-200";
    };

    const renderBookingCard = (b: Booking, dim = false) => (
        <div
            key={b.id}
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
                    <span className="text-gold-600 font-bold">₹{b.amount.toLocaleString("en-IN")}</span>
                    {b.promoCode && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                            {b.promoCode} (-₹{b.discountAmount})
                        </span>
                    )}
                </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gold-500" />{b.consultationDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold-500" />{b.consultationTime}</span>
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-gold-500" />{b.duration} min • {b.consultationType}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gold-500" />{b.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gold-500" />{b.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-500" />{b.birthPlace}</span>
                <span className="flex items-center gap-1 text-gray-500">DOB: {b.dob}</span>
                <span className="flex items-center gap-1 text-gray-500">TOB: {b.tob}</span>
                <span className="flex items-center gap-1 text-gray-500">Gender: {b.gender}</span>
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
            {b.meetingLink && (
                <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <strong>🔗 Meeting:</strong>{" "}
                    <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="underline">
                        {b.meetingLink}
                    </a>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-200">
                {b.status === "Upcoming" && (
                    <>
                        <button
                            onClick={() => updateBooking(b.id, { status: "Completed" })}
                            disabled={actionLoading === b.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                        <button
                            onClick={() => updateBooking(b.id, { status: "Cancelled" })}
                            disabled={actionLoading === b.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-3 h-3" /> Cancel
                        </button>
                    </>
                )}
                <button
                    onClick={() => {
                        setNoteModal({ id: b.id, current: b.adminNotes || "" });
                        setNoteText(b.adminNotes || "");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                    <StickyNote className="w-3 h-3" /> Notes
                </button>
                <button
                    onClick={() => {
                        setLinkModal({ id: b.id, current: b.meetingLink || "" });
                        setLinkText(b.meetingLink || "");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                    <Link2 className="w-3 h-3" /> Meeting Link
                </button>
                {b.status === "Completed" && (
                    <button
                        onClick={() => sendFollowUp(b.id)}
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

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Top Bar */}
            <header className="bg-white dark:bg-slate-900 border-b border-cream-400/50 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center text-white shadow-lg shadow-gold-500/20">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 leading-none">Admin Dashboard</h1>
                            <p className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest mt-1">Management Suite</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => signOut()}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-500 transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats / Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-cream-400/50 dark:border-slate-800 shadow-sm">
                            <p className="text-xs font-semibold text-cream-600 dark:text-slate-500 uppercase">Total Bookings</p>
                            <p className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mt-1">{bookings.length}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-cream-400/50 dark:border-slate-800 shadow-sm">
                            <p className="text-xs font-semibold text-cream-600 dark:text-slate-500 uppercase">Total Clients</p>
                            <p className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mt-1">{deriveClients(bookings).length}</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-cream-400/50 dark:border-slate-800 shadow-sm">
                        <p className="text-xs font-semibold text-cream-600 dark:text-slate-500 uppercase mb-4">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={async () => {
                                    setActionLoading("reminders");
                                    try {
                                        const res = await fetch("/api/admin/reminders/send");
                                        const data = await res.json();
                                        alert(data.message || data.error);
                                    } catch {
                                        alert("Failed to run reminders.");
                                    } finally {
                                        setActionLoading(null);
                                    }
                                }}
                                disabled={actionLoading === "reminders"}
                                className="px-4 py-2 rounded-xl bg-gold-100 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 text-sm font-medium hover:bg-gold-200 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4" /> {actionLoading === "reminders" ? "Running..." : "Run Reminders"}
                            </button>
                            <button
                                onClick={async () => {
                                    window.location.href = "/api/admin/export?type=bookings";
                                }}
                                className="px-4 py-2 rounded-xl bg-cream-100 dark:bg-slate-800 text-cream-700 dark:text-slate-400 text-sm font-medium hover:bg-cream-200 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Bookings
                            </button>
                            <button
                                onClick={async () => {
                                    window.location.href = "/api/admin/export?type=clients";
                                }}
                                className="px-4 py-2 rounded-xl bg-cream-100 dark:bg-slate-800 text-cream-700 dark:text-slate-400 text-sm font-medium hover:bg-cream-200 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Clients
                            </button>
                            <button
                                onClick={() => setAnnounceModal(true)}
                                className="px-4 py-2 rounded-xl bg-gold-600 text-white text-sm font-medium hover:bg-gold-500 shadow-sm flex items-center gap-2 transition-all"
                            >
                                <Megaphone className="w-4 h-4" /> Bulk Announcement
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(["bookings", "clients", "packages"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t
                                ? "bg-gold-500 text-white shadow-sm"
                                : "bg-white text-cream-700 border border-cream-400/50 hover:bg-cream-50"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Bookings Tab */}
                {tab === "bookings" && (
                    <div className="space-y-8">
                        {upcoming.length > 0 && (
                            <section>
                                <h2 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gold-600" /> Upcoming ({upcoming.length})
                                </h2>
                                <div className="space-y-3">{upcoming.map((b) => renderBookingCard(b))}</div>
                            </section>
                        )}
                        {past.length > 0 && (
                            <section>
                                <h2 className="text-lg font-serif text-gray-800 mb-3">⏰ Needs Action ({past.length})</h2>
                                <p className="text-xs text-gray-500 mb-3">Past bookings still marked as Upcoming. Mark them as Completed or Cancelled.</p>
                                <div className="space-y-3">{past.map((b) => renderBookingCard(b))}</div>
                            </section>
                        )}
                        {completed.length > 0 && (
                            <section>
                                <h2 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" /> Completed ({completed.length})
                                </h2>
                                <div className="space-y-3">{completed.map((b) => renderBookingCard(b, true))}</div>
                            </section>
                        )}
                        {cancelled.length > 0 && (
                            <section>
                                <h2 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-600" /> Cancelled ({cancelled.length})
                                </h2>
                                <div className="space-y-3">{cancelled.map((b) => renderBookingCard(b, true))}</div>
                            </section>
                        )}
                        {bookings.length === 0 && (
                            <div className="text-center py-12 text-cream-600">No bookings yet.</div>
                        )}
                    </div>
                )}

                {/* Packages Tab */}
                {tab === "packages" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-cream-400/50">
                            <h2 className="text-lg font-serif text-gray-800 flex items-center gap-2">
                                <Box className="w-5 h-5 text-gold-600" /> Service Packages
                            </h2>
                            <button
                                onClick={() => setPackageModal(true)}
                                className="px-4 py-2 rounded-lg bg-gold-600 text-white text-sm font-medium"
                            >
                                + Create Package
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="bg-white border border-cream-400/50 p-5 rounded-xl shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                                        <span className="text-gold-600 font-bold text-lg">₹{pkg.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{pkg.description}</p>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-cream-600">
                                        <span className="bg-cream-100 px-2 py-1 rounded">{pkg.sessionCount} Sessions</span>
                                        <span className={pkg.isActive ? "text-green-600" : "text-red-600"}>
                                            {pkg.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clients Tab */}
                {tab === "clients" && (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-400/50 text-sm text-gray-800 placeholder-cream-400 focus:outline-none focus:border-gold-500"
                            />
                        </div>
                        <div className="space-y-3">
                            {filteredClients.map((c) => (
                                <div key={c.email} className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gold-600" />
                                            <span className="font-semibold text-gray-800">{c.name}</span>
                                            <span className="text-xs bg-cream-200 text-cream-700 px-2 py-0.5 rounded-full">
                                                {c.bookingCount} booking{c.bookingCount !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-gold-600">₹{c.totalSpent.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-gray-600">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gold-400" />{c.email}</span>
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gold-400" />{c.phone}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-400" />{c.birthPlace}</span>
                                        <span>DOB: {c.dob}</span>
                                        <span>TOB: {c.tob}</span>
                                        <span>Gender: {c.gender}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredClients.length === 0 && (
                                <div className="text-center py-8 text-cream-600">No clients found.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes Modal */}
                {noteModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setNoteModal(null)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-serif text-gray-800 mb-3">📝 Admin Notes</h3>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={4}
                                className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 resize-none"
                                placeholder="Session notes, observations..."
                            />
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={async () => {
                                        await updateBooking(noteModal.id, { adminNotes: noteText });
                                        setNoteModal(null);
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setNoteModal(null)}
                                    className="px-4 py-2 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meeting Link Modal */}
                {linkModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setLinkModal(null)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-serif text-gray-800 mb-3">🔗 Meeting Link</h3>
                            <input
                                type="url"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                                placeholder="https://meet.google.com/..."
                            />
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={async () => {
                                        await updateBooking(linkModal.id, { meetingLink: linkText });
                                        setLinkModal(null);
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setLinkModal(null)}
                                    className="px-4 py-2 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Announcement Modal */}
            {announceModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setAnnounceModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-gold-600" /> Bulk Announcement
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Send an email to all unique clients in the system.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    value={announceSubject}
                                    onChange={(e) => setAnnounceSubject(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                                    placeholder="e.g. Special Holiday Discount!"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Message</label>
                                <textarea
                                    value={announceMessage}
                                    onChange={(e) => setAnnounceMessage(e.target.value)}
                                    rows={5}
                                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 resize-none"
                                    placeholder="Write your announcement here..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={async () => {
                                    if (!announceSubject || !announceMessage) return alert("Please fill details");
                                    setActionLoading("announcement");
                                    try {
                                        const res = await fetch("/api/admin/announcements/send", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ subject: announceSubject, message: announceMessage }),
                                        });
                                        const data = await res.json();
                                        alert(data.message || data.error);
                                        if (res.ok) setAnnounceModal(false);
                                    } catch {
                                        alert("Failed to send.");
                                    } finally {
                                        setActionLoading(null);
                                    }
                                }}
                                disabled={actionLoading === "announcement"}
                                className="flex-1 py-3 rounded-xl bg-gold-600 text-white text-sm font-semibold hover:bg-gold-500 transition-all shadow-md disabled:opacity-50"
                            >
                                {actionLoading === "announcement" ? "Sending..." : "Send to All Clients"}
                            </button>
                            <button
                                onClick={() => setAnnounceModal(false)}
                                className="px-6 py-3 rounded-xl bg-cream-100 text-cream-700 text-sm font-semibold hover:bg-cream-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
