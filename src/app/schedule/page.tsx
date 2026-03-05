"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import BookingLayout from "@/components/BookingLayout";
import { Duration } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Calendar, Ban, Loader2, AlertTriangle } from "lucide-react";
import { format, addDays, startOfMonth, getDaysInMonth, getDay, isSameMonth, addMonths, subMonths } from "date-fns";

const durations: { value: Duration; label: string }[] = [
    { value: 40, label: "40 Minutes" },
    { value: 90, label: "1 Hour 30 Minutes" },
];

interface AvailSlot {
    dayOfWeek: number;
    timeSlot: string;
}

interface BookedSlot {
    date: string;
    time: string;
}

function generateAvailableDates(blockedDates: string[]): Set<string> {
    const available = new Set<string>();
    const today = new Date();
    const blocked = new Set(blockedDates);
    for (let i = 1; i <= 60; i++) {
        const date = addDays(today, i);
        const val = format(date, "yyyy-MM-dd");
        if (!blocked.has(val)) available.add(val);
    }
    return available;
}

function CalendarPicker({
    availableDates,
    blockedDates,
    bookedSlots,
    availSlots,
    selected,
    onSelect,
}: {
    availableDates: Set<string>;
    blockedDates: string[];
    bookedSlots: BookedSlot[];
    availSlots: AvailSlot[];
    selected: string;
    onSelect: (d: string) => void;
}) {
    const [viewMonth, setViewMonth] = useState(() => startOfMonth(addDays(new Date(), 1)));
    const today = new Date();
    const blocked = new Set(blockedDates);

    const daysInMonth = getDaysInMonth(viewMonth);
    const firstDow = getDay(startOfMonth(viewMonth)); // 0=Sun
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const isAllBooked = (dateStr: string) => {
        const dow = new Date(dateStr).getDay();
        const slots = availSlots.filter((s) => s.dayOfWeek === dow);
        return slots.length > 0 && slots.every((s) => bookedSlots.some((b) => b.date === dateStr && b.time === s.timeSlot));
    };

    const getDayStatus = (dateStr: string): "available" | "blocked" | "booked" | "unavailable" | "past" => {
        const d = new Date(dateStr);
        if (d <= today) return "past";
        if (blocked.has(dateStr)) return "blocked";
        if (!availableDates.has(dateStr)) return "unavailable";
        if (isAllBooked(dateStr)) return "booked";
        return "available";
    };

    return (
        <div className="rounded-2xl border-2 border-cream-400/50 bg-white overflow-hidden">
            {/* Month Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gold-50 border-b border-cream-200">
                <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="w-8 h-8 rounded-lg hover:bg-gold-100 flex items-center justify-center text-gold-600 font-bold transition-colors">&lt;</button>
                <span className="font-serif font-semibold text-gray-800">{format(viewMonth, "MMMM yyyy")}</span>
                <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="w-8 h-8 rounded-lg hover:bg-gold-100 flex items-center justify-center text-gold-600 font-bold transition-colors">&gt;</button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-cream-100">
                {dayNames.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-cream-500 py-2">{d}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 p-2 gap-1">
                {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                    const dateStr = format(date, "yyyy-MM-dd");
                    const status = getDayStatus(dateStr);
                    const isSelected = selected === dateStr;
                    const isThisMonth = isSameMonth(date, viewMonth);

                    return (
                        <button
                            key={day}
                            onClick={() => status === "available" && onSelect(dateStr)}
                            disabled={status !== "available"}
                            title={status === "booked" ? "Fully booked" : status === "blocked" ? "Not available" : undefined}
                            className={cn(
                                "relative w-full aspect-square rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center",
                                !isThisMonth && "opacity-30",
                                status === "past" && "text-gray-300 cursor-default",
                                status === "unavailable" && "text-gray-300 cursor-default",
                                status === "blocked" && "text-red-300 cursor-not-allowed line-through",
                                status === "booked" && "text-amber-300 cursor-not-allowed",
                                status === "available" && !isSelected && "text-gray-700 hover:bg-gold-50 hover:text-gold-700 hover:border-gold-300 border border-transparent cursor-pointer",
                                isSelected && "bg-gold-500 text-white shadow-md shadow-gold-500/30 border border-gold-400",
                            )}
                        >
                            {day}
                            {status === "booked" && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-cream-100 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gold-400" />Available</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-200" />Fully Booked</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-200" />Unavailable</span>
            </div>
        </div>
    );
}

export default function SchedulePage() {
    const router = useRouter();
    const { formData, updateFormData, setCurrentStep } = useBooking();
    const [selectedDuration, setSelectedDuration] = useState<Duration | null>(formData.duration);
    const [selectedDate, setSelectedDate] = useState<string>(formData.consultationDate || "");
    const [selectedTime, setSelectedTime] = useState<string | null>(formData.consultationTime);
    const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
    const [availSlots, setAvailSlots] = useState<AvailSlot[]>([]);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [waitlistDone, setWaitlistDone] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch("/api/booked-slots").then((r) => r.json()),
            fetch("/api/availability").then((r) => r.json()),
        ])
            .then(([bookedData, availData]) => {
                setBookedSlots(bookedData.bookedSlots || []);
                setAvailSlots(availData.slots || []);
                setBlockedDates(availData.blockedDates || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const availableDates = generateAvailableDates(blockedDates);

    // Get the selected date's day of week
    const selectedDayOfWeek =
        selectedDate ? new Date(selectedDate + "T00:00:00").getDay() : undefined;

    // Filter time slots for the selected day
    const timeSlotsForDate =
        selectedDayOfWeek !== undefined
            ? availSlots.filter((s) => s.dayOfWeek === selectedDayOfWeek)
            : [];

    const isSlotBooked = (date: string, time: string) => {
        return bookedSlots.some((slot) => slot.date === date && slot.time === time);
    };

    // Check if all slots for date are booked
    const allSlotsBooked =
        selectedDate &&
        timeSlotsForDate.length > 0 &&
        timeSlotsForDate.every((s) => isSlotBooked(selectedDate, s.timeSlot));

    const canProceed = selectedDuration && selectedDate && selectedTime;

    const handleContinue = () => {
        if (!canProceed) return;
        updateFormData({
            duration: selectedDuration,
            consultationDate: selectedDate,
            consultationTime: selectedTime,
        });
        setCurrentStep(5);
        router.push("/details");
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setWaitlistDone(false);
    };

    const handleJoinWaitlist = async () => {
        if (!selectedDate || !formData.name) {
            alert("Please complete the details step first to join the waitlist.");
            return;
        }
        setWaitlistLoading(true);
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDate,
                    name: formData.name || "Guest",
                    email: formData.email || "unknown",
                    phone: formData.phone || "unknown",
                }),
            });
            if (res.ok) {
                setWaitlistDone(true);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to join waitlist");
            }
        } catch {
            alert("Error joining waitlist");
        } finally {
            setWaitlistLoading(false);
        }
    };

    if (loading) {
        return (
            <BookingLayout>
                <Stepper currentStep={4} />
                <StepCard title="Schedule Your Consultation" subtitle="Loading available slots...">
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                    </div>
                </StepCard>
            </BookingLayout>
        );
    }

    return (
        <BookingLayout>
            <Stepper currentStep={4} />
            <StepCard
                title="Schedule Your Consultation"
                subtitle="Choose your preferred duration, date, and time"
            >
                <div className="space-y-8">
                    {/* Duration */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                            <Clock className="w-4 h-4 text-gold-600" />
                            Session Duration
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {durations.map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setSelectedDuration(d.value)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-center transition-all duration-300",
                                        "hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10",
                                        "active:scale-[0.98]",
                                        selectedDuration === d.value
                                            ? "border-gold-500 bg-gold-50"
                                            : "border-cream-400/60 bg-cream-50"
                                    )}
                                >
                                    <div className="font-semibold text-gray-800">{d.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date — Calendar Picker */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                            <Calendar className="w-4 h-4 text-gold-600" />
                            Consultation Date
                            {selectedDate && <span className="ml-auto text-gold-600 font-semibold text-xs">{format(new Date(selectedDate + "T00:00:00"), "EEE, MMM dd, yyyy")}</span>}
                        </label>
                        <CalendarPicker
                            availableDates={availableDates}
                            blockedDates={blockedDates}
                            bookedSlots={bookedSlots}
                            availSlots={availSlots}
                            selected={selectedDate}
                            onSelect={handleDateChange}
                        />
                    </div>

                    {/* Time Slot */}
                    {selectedDate && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                                <Clock className="w-4 h-4 text-gold-600" />
                                Time Slot
                            </label>
                            {timeSlotsForDate.length === 0 ? (
                                <div className="rounded-xl bg-cream-50 border border-cream-400/50 p-6 text-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">No time slots available for this day.</p>
                                    <p className="text-xs text-gray-400 mt-1">Please select a different date.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {timeSlotsForDate.map((slot) => {
                                        const booked = isSlotBooked(selectedDate, slot.timeSlot);
                                        return (
                                            <button
                                                key={slot.timeSlot}
                                                onClick={() => !booked && setSelectedTime(slot.timeSlot)}
                                                disabled={booked}
                                                className={cn(
                                                    "relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                                                    booked
                                                        ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                                                        : [
                                                            "hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10",
                                                            "active:scale-[0.98]",
                                                            selectedTime === slot.timeSlot
                                                                ? "border-gold-500 bg-gold-50"
                                                                : "border-cream-400/60 bg-cream-50",
                                                        ]
                                                )}
                                            >
                                                {booked ? (
                                                    <>
                                                        <Ban className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-400 font-medium line-through">
                                                            {slot.timeSlot}
                                                        </span>
                                                        <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                                                            Booked
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-4 h-4 text-gold-600" />
                                                        <span className="text-gray-800 font-medium">
                                                            {slot.timeSlot}
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Waitlist */}
                            {allSlotsBooked && (
                                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                                    <p className="text-sm text-amber-700 mb-2">All slots are booked for this date.</p>
                                    {waitlistDone ? (
                                        <p className="text-sm text-green-600 font-medium">
                                            ✓ You&apos;re on the waitlist! We&apos;ll notify you if a slot opens up.
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleJoinWaitlist}
                                            disabled={waitlistLoading}
                                            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition-colors disabled:opacity-50"
                                        >
                                            {waitlistLoading ? "Joining..." : "Join Waitlist"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Continue */}
                    <button
                        onClick={handleContinue}
                        disabled={!canProceed}
                        className={cn(
                            "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300",
                            canProceed
                                ? "bg-gold-500 hover:bg-gold-400 text-white hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
                                : "bg-cream-300 text-cream-600 cursor-not-allowed"
                        )}
                    >
                        Continue
                    </button>
                </div>
            </StepCard>
        </BookingLayout>
    );
}
