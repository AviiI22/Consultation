"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Search,
    Loader2,
    LayoutDashboard,
} from "lucide-react";

import { BookingCard, type Booking } from "@/components/admin/BookingCard";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { QuickActions } from "@/components/admin/QuickActions";
import { ClientsTab, type ClientData } from "@/components/admin/ClientsTab";
import { PackagesTab } from "@/components/admin/PackagesTab";
import { AnnouncementModal } from "@/components/admin/AnnouncementModal";
import { NotesModal, MeetLinkModal } from "@/components/admin/NotesModal";

interface ServicePackage {
    id: string;
    name: string;
    description: string;
    sessionCount: number;
    price: number;
    isActive: boolean;
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

function AdminDashboardInner() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"bookings" | "clients" | "packages">("bookings");
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [bookingSearch, setBookingSearch] = useState("");
    const [bookingStatusFilter, setBookingStatusFilter] = useState<"all" | "Upcoming" | "Completed" | "Cancelled">("all");
    const [announceModal, setAnnounceModal] = useState(false);
    const [noteModal, setNoteModal] = useState<{ id: string; current: string } | null>(null);
    const [linkModal, setLinkModal] = useState<{ id: string; current: string } | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const showToast = useCallback((message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    }, []);

    // Check Google Auth status on mount
    useEffect(() => {
        fetch("/api/admin/google-auth/status")
            .then((r) => r.json())
            .then((d) => setGoogleConnected(d.connected))
            .catch(() => setGoogleConnected(false));
    }, []);

    // Handle Google Auth callback result from URL params
    useEffect(() => {
        const authResult = searchParams.get("google_auth");
        if (authResult === "success") {
            showToast("✅ Google Calendar connected! Google Meet will now be auto-created for new bookings.", "success");
            setGoogleConnected(true);
            router.replace("/admin");
        } else if (authResult === "error") {
            const reason = searchParams.get("reason") || "unknown";
            showToast(`❌ Google Calendar connection failed (${reason}). Please try again.`, "error");
            router.replace("/admin");
        }
    }, [searchParams, showToast, router]);

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
                showToast("Follow-up email sent!", "success");
            } else {
                showToast("Failed to send follow-up email.", "error");
            }
        } catch {
            showToast("Error sending follow-up.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const generateMeetLink = async (bookingId: string, notifyClient = true) => {
        setActionLoading(`meet-${bookingId}`);
        try {
            const res = await fetch("/api/admin/bookings/generate-meet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, notifyClient }),
            });
            const data = await res.json();
            if (res.ok && data.meetingLink) {
                showToast("✅ Google Meet link generated" + (notifyClient ? " and client notified!" : "!"), "success");
                await fetchBookings();
            } else {
                showToast(`❌ ${data.error || "Failed to generate meeting link"}`, "error");
            }
        } catch {
            showToast("Error generating meeting link.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ─── Derived data ───────────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const paid = bookings.filter((b) => b.paymentStatus === "Paid");
    const clients = deriveClients(bookings);

    // Booking search/filter
    const filteredBookings = paid.filter((b) => {
        const q = bookingSearch.toLowerCase();
        const matchesSearch = !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.phone.includes(q);
        const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
        return matchesSearch && matchesStatus;
    });
    const filteredUpcoming = filteredBookings.filter((b) => b.consultationDate >= today && b.status === "Upcoming");
    const filteredCompleted = filteredBookings.filter((b) => b.status === "Completed");
    const filteredCancelled = filteredBookings.filter((b) => b.status === "Cancelled");
    const filteredPast = filteredBookings.filter((b) => b.consultationDate < today && b.status === "Upcoming");

    // ─── Quick action handlers ──────────────────────────────────────────────
    const handleConnectGoogle = () => { window.location.href = "/api/admin/google-auth"; };
    const handleDisconnectGoogle = async () => {
        setActionLoading("google-disconnect");
        try {
            const res = await fetch("/api/admin/google-auth/disconnect", { method: "POST" });
            if (res.ok) {
                setGoogleConnected(false);
                showToast("Google Calendar disconnected. You can reconnect anytime.", "success");
            } else {
                showToast("Failed to disconnect Google Calendar.", "error");
            }
        } catch {
            showToast("Error disconnecting Google Calendar.", "error");
        } finally {
            setActionLoading(null);
        }
    };
    const handleRunReminders = async () => {
        setActionLoading("reminders");
        try {
            const res = await fetch("/api/admin/reminders/send", { method: "POST" });
            const data = await res.json();
            showToast(data.message || data.error, data.message ? "success" : "error");
        } catch {
            showToast("Failed to run reminders.", "error");
        } finally {
            setActionLoading(null);
        }
    };
    const handleCleanup = async () => {
        setActionLoading("cleanup");
        try {
            const res = await fetch("/api/admin/cleanup-pending", { method: "POST" });
            const data = await res.json();
            showToast(data.message || data.error, res.ok ? "success" : "error");
            if (res.ok) await fetchBookings();
        } catch {
            showToast("Cleanup failed.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 transition-colors duration-300">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-in slide-in-from-top-2 max-w-sm ${toast.type === "success"
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                        }`}
                >
                    {toast.message}
                </div>
            )}

            {/* Top Bar */}
            <header className="bg-white border-b border-cream-400/50 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-600 flex items-center justify-center text-white shadow-lg shadow-gold-500/20">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-serif font-bold text-gray-800 leading-none">Admin Dashboard</h1>
                            <p className="text-[10px] text-gold-600 font-bold uppercase tracking-widest mt-1">Management Suite</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="text-xs font-semibold text-red-600 hover:text-red-500 transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats / Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatsGrid
                        totalBookings={bookings.length}
                        totalClients={clients.length}
                    />
                    <QuickActions
                        googleConnected={googleConnected}
                        actionLoading={actionLoading}
                        onConnectGoogle={handleConnectGoogle}
                        onDisconnectGoogle={handleDisconnectGoogle}
                        onRunReminders={handleRunReminders}
                        onCleanup={handleCleanup}
                        onExportBookings={() => { window.location.href = "/api/admin/export?type=bookings"; }}
                        onExportClients={() => { window.location.href = "/api/admin/export?type=clients"; }}
                        onOpenAnnouncement={() => setAnnounceModal(true)}
                    />
                </div>

                {/* Tabs — scrollable on mobile */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
                    {(["bookings", "clients", "packages"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${tab === t
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
                    <div className="space-y-5">
                        {/* Search + Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone, ID..."
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-400/50 text-sm text-gray-800 placeholder-cream-400 focus:outline-none focus:border-gold-500"
                                />
                            </div>
                            <select
                                value={bookingStatusFilter}
                                onChange={(e) => setBookingStatusFilter(e.target.value as typeof bookingStatusFilter)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-cream-400/50 text-sm text-gray-700 focus:outline-none focus:border-gold-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-8">
                            {filteredUpcoming.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gold-600" /> Upcoming ({filteredUpcoming.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {filteredUpcoming.map((b) => (
                                            <BookingCard
                                                key={b.id}
                                                booking={b}
                                                actionLoading={actionLoading}
                                                googleConnected={googleConnected}
                                                onUpdateBooking={updateBooking}
                                                onSendFollowUp={sendFollowUp}
                                                onGenerateMeet={generateMeetLink}
                                                onOpenNotes={(id, current) => setNoteModal({ id, current })}
                                                onOpenMeetLink={(id, current) => setLinkModal({ id, current })}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {filteredPast.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-serif text-gray-800 mb-3">⏰ Needs Action ({filteredPast.length})</h2>
                                    <p className="text-xs text-gray-500 mb-3">Past bookings still marked as Upcoming. Click &ldquo;Cleanup &amp; Auto-complete&rdquo; in Quick Actions to handle them automatically.</p>
                                    <div className="space-y-3">
                                        {filteredPast.map((b) => (
                                            <BookingCard
                                                key={b.id}
                                                booking={b}
                                                actionLoading={actionLoading}
                                                googleConnected={googleConnected}
                                                onUpdateBooking={updateBooking}
                                                onSendFollowUp={sendFollowUp}
                                                onGenerateMeet={generateMeetLink}
                                                onOpenNotes={(id, current) => setNoteModal({ id, current })}
                                                onOpenMeetLink={(id, current) => setLinkModal({ id, current })}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {filteredCompleted.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" /> Completed ({filteredCompleted.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {filteredCompleted.map((b) => (
                                            <BookingCard
                                                key={b.id}
                                                booking={b}
                                                dim
                                                actionLoading={actionLoading}
                                                googleConnected={googleConnected}
                                                onUpdateBooking={updateBooking}
                                                onSendFollowUp={sendFollowUp}
                                                onGenerateMeet={generateMeetLink}
                                                onOpenNotes={(id, current) => setNoteModal({ id, current })}
                                                onOpenMeetLink={(id, current) => setLinkModal({ id, current })}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {filteredCancelled.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-600" /> Cancelled ({filteredCancelled.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {filteredCancelled.map((b) => (
                                            <BookingCard
                                                key={b.id}
                                                booking={b}
                                                dim
                                                actionLoading={actionLoading}
                                                googleConnected={googleConnected}
                                                onUpdateBooking={updateBooking}
                                                onSendFollowUp={sendFollowUp}
                                                onGenerateMeet={generateMeetLink}
                                                onOpenNotes={(id, current) => setNoteModal({ id, current })}
                                                onOpenMeetLink={(id, current) => setLinkModal({ id, current })}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {filteredBookings.length === 0 && (
                                <div className="text-center py-12 text-cream-600">
                                    {bookingSearch || bookingStatusFilter !== "all" ? "No bookings match your search." : "No bookings yet."}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Packages Tab */}
                {tab === "packages" && (
                    <PackagesTab
                        packages={packages}
                        onRefresh={fetchPackages}
                        showToast={showToast}
                    />
                )}

                {/* Clients Tab */}
                {tab === "clients" && (
                    <ClientsTab clients={clients} />
                )}

                {/* Modals */}
                <NotesModal
                    open={!!noteModal}
                    bookingId={noteModal?.id || ""}
                    currentNote={noteModal?.current || ""}
                    onClose={() => setNoteModal(null)}
                    onSave={(id, note) => updateBooking(id, { adminNotes: note })}
                />
                <MeetLinkModal
                    open={!!linkModal}
                    bookingId={linkModal?.id || ""}
                    currentLink={linkModal?.current || ""}
                    onClose={() => setLinkModal(null)}
                    onSave={(id, link) => updateBooking(id, { meetingLink: link })}
                />
                <AnnouncementModal
                    open={announceModal}
                    onClose={() => setAnnounceModal(false)}
                    showToast={showToast}
                />
            </main>
        </div>
    );
}


export default function AdminDashboard() {
    return (
        <Suspense fallback={null}>
            <AdminDashboardInner />
        </Suspense>
    );
}
