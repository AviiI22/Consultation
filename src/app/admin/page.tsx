"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    Sparkles,
    IndianRupee,
    LayoutDashboard,
    CalendarCheck,
    CalendarClock,
    Ban,
    LogOut,
    Users,
    Search,
    MapPin,
    Cake,
    Timer,
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
    createdAt: string;
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
}

function StatusBadge({ status }: { status: string }) {
    const isPaid = status === "Paid";
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isPaid
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-green-500" : "bg-amber-500"
                    }`}
            />
            {status}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    const isUrgent = type === "urgent";
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isUrgent
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-blue-50 text-blue-600 border border-blue-200"
                }`}
        >
            {isUrgent ? "Urgent" : "Normal"}
        </span>
    );
}

function deriveClients(bookings: Booking[]): ClientData[] {
    const clientMap = new Map<string, ClientData>();

    for (const b of bookings) {
        const existing = clientMap.get(b.email);
        if (existing) {
            existing.bookingCount++;
            if (b.paymentStatus === "Paid") {
                existing.totalSpent += b.amount;
            }
            if (b.consultationDate > existing.lastBooking) {
                existing.lastBooking = b.consultationDate;
                existing.name = b.name;
                existing.phone = b.phone;
                existing.dob = b.dob;
                existing.tob = b.tob;
                existing.gender = b.gender;
                existing.birthPlace = b.birthPlace;
            }
        } else {
            clientMap.set(b.email, {
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
            });
        }
    }

    return Array.from(clientMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
    );
}

export default function AdminDashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"bookings" | "clients">("bookings");
    const [clientSearch, setClientSearch] = useState("");

    useEffect(() => {
        fetch("/api/admin/bookings")
            .then((res) => res.json())
            .then((data) => {
                setBookings(data.bookings || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const today = new Date().toISOString().split("T")[0];
    const upcomingBookings = bookings.filter((b) => b.consultationDate >= today);
    const pastBookings = bookings.filter((b) => b.consultationDate < today);
    const paidCount = bookings.filter((b) => b.paymentStatus === "Paid").length;
    const totalRevenue = bookings
        .filter((b) => b.paymentStatus === "Paid")
        .reduce((sum, b) => sum + b.amount, 0);

    const clients = deriveClients(bookings);
    const filteredClients = clients.filter(
        (c) =>
            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.phone.includes(clientSearch)
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-gold-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-cream-700 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gold-100 border border-gold-200">
                        <LayoutDashboard className="w-6 h-6 text-gold-700" />
                    </div>
                    <div>
                        <h1 className="font-serif text-2xl sm:text-3xl text-gold-gradient tracking-wide">
                            Admin Dashboard
                        </h1>
                        <p className="text-cream-700 text-sm mt-0.5">
                            Manage your consultation bookings
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-cream-400/60 text-cream-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-300 text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarCheck className="w-4 h-4 text-gold-600" />
                        <span className="text-xs font-medium text-cream-700 uppercase tracking-wide">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarClock className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-cream-700 uppercase tracking-wide">Upcoming</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{upcomingBookings.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-cream-700 uppercase tracking-wide">Paid</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{paidCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gold-600" />
                        <span className="text-xs font-medium text-cream-700 uppercase tracking-wide">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString("en-IN")}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-6 bg-cream-200 rounded-xl p-1">
                <button
                    onClick={() => setActiveTab("bookings")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "bookings"
                            ? "bg-white text-gold-700 shadow-sm"
                            : "text-cream-700 hover:text-gray-700"
                        }`}
                >
                    <CalendarCheck className="w-4 h-4" />
                    Bookings
                </button>
                <button
                    onClick={() => setActiveTab("clients")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === "clients"
                            ? "bg-white text-gold-700 shadow-sm"
                            : "text-cream-700 hover:text-gray-700"
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Clients
                    <span className="bg-gold-100 text-gold-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        {clients.length}
                    </span>
                </button>
            </div>

            {/* ===== BOOKINGS TAB ===== */}
            {activeTab === "bookings" && (
                <>
                    {/* Upcoming Bookings */}
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarClock className="w-5 h-5 text-gold-600" />
                            <h2 className="font-serif text-xl text-gray-800">Upcoming Consultations</h2>
                            <span className="ml-auto text-sm text-cream-700">
                                {upcomingBookings.length} booking{upcomingBookings.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {upcomingBookings.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-cream-400/50 p-12 text-center">
                                <Ban className="w-12 h-12 text-cream-500 mx-auto mb-3" />
                                <p className="text-cream-700 font-medium">No upcoming consultations</p>
                                <p className="text-cream-600 text-sm mt-1">
                                    Bookings will appear here once clients schedule sessions.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-white rounded-2xl border border-cream-400/50 p-5 shadow-sm hover:shadow-md hover:border-gold-300/50 transition-all duration-300 group"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex items-center gap-3 sm:min-w-[220px]">
                                                <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 group-hover:bg-gold-100 transition-colors">
                                                    <Calendar className="w-5 h-5 text-gold-700" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">
                                                        {booking.consultationDate}
                                                    </p>
                                                    <p className="text-gold-700 text-xs flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {booking.consultationTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <User className="w-3.5 h-3.5 text-cream-600" />
                                                    <span className="font-medium">{booking.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Mail className="w-3.5 h-3.5 text-cream-600" />
                                                    <span className="truncate">{booking.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Phone className="w-3.5 h-3.5 text-cream-600" />
                                                    {booking.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-3.5 h-3.5 text-cream-600" />
                                                    {booking.duration === 60 ? "1 Hour" : "30 Min"}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                                <TypeBadge type={booking.consultationType} />
                                                <StatusBadge status={booking.paymentStatus} />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    ₹{booking.amount.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        </div>

                                        {booking.concern && (
                                            <div className="mt-3 pt-3 border-t border-cream-300/50">
                                                <p className="text-xs text-cream-700 font-medium mb-1">Concern:</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {booking.concern}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Past Bookings */}
                    {pastBookings.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-cream-600" />
                                <h2 className="font-serif text-xl text-gray-700">Past Consultations</h2>
                                <span className="ml-auto text-sm text-cream-700">
                                    {pastBookings.length} booking{pastBookings.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="space-y-3 opacity-70">
                                {pastBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-white/70 rounded-2xl border border-cream-400/30 p-5"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex items-center gap-3 sm:min-w-[220px]">
                                                <div className="p-3 rounded-xl bg-cream-200 border border-cream-300">
                                                    <Calendar className="w-5 h-5 text-cream-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-600 text-sm">
                                                        {booking.consultationDate}
                                                    </p>
                                                    <p className="text-cream-600 text-xs flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {booking.consultationTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="w-3.5 h-3.5 text-cream-500" />
                                                    <span className="font-medium">{booking.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Mail className="w-3.5 h-3.5 text-cream-500" />
                                                    <span className="truncate">{booking.email}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                                <StatusBadge status={booking.paymentStatus} />
                                                <span className="text-sm font-semibold text-gray-500">
                                                    ₹{booking.amount.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* ===== CLIENTS TAB ===== */}
            {activeTab === "clients" && (
                <section>
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-600" />
                            <input
                                type="text"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                placeholder="Search by name, email, or phone..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-cream-400/60 text-gray-800 placeholder-cream-600 focus:border-gold-500 focus:outline-none transition-colors duration-300"
                            />
                        </div>
                    </div>

                    {filteredClients.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-cream-400/50 p-12 text-center">
                            <Users className="w-12 h-12 text-cream-500 mx-auto mb-3" />
                            <p className="text-cream-700 font-medium">
                                {clientSearch ? "No clients match your search" : "No clients yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.email}
                                    className="bg-white rounded-2xl border border-cream-400/50 p-5 shadow-sm hover:shadow-md hover:border-gold-300/50 transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        {/* Avatar & Name */}
                                        <div className="flex items-center gap-3 sm:min-w-[200px]">
                                            <div className="w-12 h-12 rounded-full bg-gold-100 border-2 border-gold-200 flex items-center justify-center flex-shrink-0">
                                                <span className="text-gold-700 font-bold text-lg">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{client.name}</p>
                                                <p className="text-xs text-cream-600 capitalize">{client.gender}</p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-3.5 h-3.5 text-cream-500 flex-shrink-0" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3.5 h-3.5 text-cream-500 flex-shrink-0" />
                                                {client.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Cake className="w-3.5 h-3.5 text-cream-500 flex-shrink-0" />
                                                DOB: {client.dob}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Timer className="w-3.5 h-3.5 text-cream-500 flex-shrink-0" />
                                                TOB: {client.tob}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                                                <MapPin className="w-3.5 h-3.5 text-cream-500 flex-shrink-0" />
                                                {client.birthPlace}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-700 border border-gold-200">
                                                <CalendarCheck className="w-3 h-3" />
                                                {client.bookingCount} booking{client.bookingCount !== 1 ? "s" : ""}
                                            </span>
                                            <span className="text-sm font-semibold text-green-600">
                                                ₹{client.totalSpent.toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-xs text-cream-600">
                                                Last: {client.lastBooking}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
