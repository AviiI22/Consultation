"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    CalendarOff,
    Loader2,
} from "lucide-react";

interface Slot {
    id: string;
    dayOfWeek: number;
    timeSlot: string;
    isActive: boolean;
}

interface BlockedDateEntry {
    id: string;
    date: string;
    reason: string | null;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDateEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [newDay, setNewDay] = useState(0);
    const [newTime, setNewTime] = useState("");
    const [newBlockDate, setNewBlockDate] = useState("");
    const [newBlockReason, setNewBlockReason] = useState("");

    const fetchAll = async () => {
        try {
            const [slotsRes, datesRes] = await Promise.all([
                fetch("/api/admin/availability"),
                fetch("/api/admin/blocked-dates"),
            ]);
            const slotsData = await slotsRes.json();
            const datesData = await datesRes.json();
            setSlots(slotsData.slots || []);
            setBlockedDates(datesData.dates || []);
        } catch {
            console.error("Failed to fetch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const addSlot = async () => {
        if (!newTime.trim()) return;
        await fetch("/api/admin/availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dayOfWeek: newDay, timeSlot: newTime }),
        });
        setNewTime("");
        fetchAll();
    };

    const toggleSlot = async (id: string, isActive: boolean) => {
        await fetch("/api/admin/availability", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isActive: !isActive }),
        });
        fetchAll();
    };

    const deleteSlot = async (id: string) => {
        await fetch("/api/admin/availability", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetchAll();
    };

    const blockDate = async () => {
        if (!newBlockDate) return;
        await fetch("/api/admin/blocked-dates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: newBlockDate, reason: newBlockReason || null }),
        });
        setNewBlockDate("");
        setNewBlockReason("");
        fetchAll();
    };

    const unblockDate = async (id: string) => {
        await fetch("/api/admin/blocked-dates", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetchAll();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    // Group slots by day
    const slotsByDay = DAY_NAMES.map((name, i) => ({
        name,
        day: i,
        slots: slots.filter((s) => s.dayOfWeek === i),
    }));

    return (
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-serif text-gray-800 mb-6">Availability Management</h1>

            {/* Add Slot */}
            <div className="bg-white rounded-xl border border-cream-400/50 p-5 mb-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-gold-600" /> Add Time Slot
                </h2>
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Day</label>
                        <select
                            value={newDay}
                            onChange={(e) => setNewDay(parseInt(e.target.value))}
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500"
                        >
                            {DAY_NAMES.map((d, i) => (
                                <option key={i} value={i}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Time Slot</label>
                        <input
                            type="text"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            placeholder="7:00 PM - 8:00 PM"
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500 w-52"
                        />
                    </div>
                    <button
                        onClick={addSlot}
                        className="px-4 py-2 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Slots by Day */}
            <div className="space-y-4 mb-8">
                {slotsByDay.map((day) => (
                    <div key={day.day} className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gold-600" /> {day.name}
                        </h3>
                        {day.slots.length === 0 ? (
                            <p className="text-xs text-cream-500 pl-6">No slots configured</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 pl-6">
                                {day.slots.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${s.isActive
                                                ? "bg-green-50 border-green-200 text-green-700"
                                                : "bg-gray-50 border-gray-200 text-gray-400 line-through"
                                            }`}
                                    >
                                        <Clock className="w-3 h-3" />
                                        {s.timeSlot}
                                        <button
                                            onClick={() => toggleSlot(s.id, s.isActive)}
                                            className="hover:text-gold-600 transition-colors"
                                            title={s.isActive ? "Disable" : "Enable"}
                                        >
                                            {s.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => deleteSlot(s.id)}
                                            className="hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Blocked Dates */}
            <div className="bg-white rounded-xl border border-cream-400/50 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CalendarOff className="w-4 h-4 text-red-500" /> Blocked Dates
                </h2>
                <div className="flex flex-wrap gap-3 items-end mb-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Date</label>
                        <input
                            type="date"
                            value={newBlockDate}
                            onChange={(e) => setNewBlockDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Reason (optional)</label>
                        <input
                            type="text"
                            value={newBlockReason}
                            onChange={(e) => setNewBlockReason(e.target.value)}
                            placeholder="Holiday, vacation..."
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500 w-48"
                        />
                    </div>
                    <button
                        onClick={blockDate}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition-colors"
                    >
                        Block
                    </button>
                </div>
                {blockedDates.length === 0 ? (
                    <p className="text-xs text-cream-500">No blocked dates</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {blockedDates.map((d) => (
                            <div key={d.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                                <CalendarOff className="w-3 h-3" />
                                {d.date}
                                {d.reason && <span className="text-red-400">({d.reason})</span>}
                                <button onClick={() => unblockDate(d.id)} className="hover:text-red-900">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
