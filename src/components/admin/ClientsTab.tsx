"use client";

import { Search, Users, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

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

interface ClientsTabProps {
    clients: ClientData[];
}

export function ClientsTab({ clients }: ClientsTabProps) {
    const [search, setSearch] = useState("");

    const filtered = clients.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search)
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-500" />
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-400/50 text-sm text-gray-800 placeholder-cream-400 focus:outline-none focus:border-gold-500"
                />
            </div>
            <div className="space-y-3">
                {filtered.map((c) => (
                    <div key={c.email} className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gold-600" />
                                <span className="font-semibold text-gray-800">{c.name}</span>
                                <span className="text-xs bg-cream-200 text-cream-700 px-2 py-0.5 rounded-full">
                                    {c.bookingCount} booking{c.bookingCount !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-gold-600">{c.totalSpent.toLocaleString("en-IN")}</span>
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
                {filtered.length === 0 && (
                    <div className="text-center py-8 text-cream-600">No clients found.</div>
                )}
            </div>
        </div>
    );
}

export type { ClientData };
