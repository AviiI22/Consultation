"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import { Duration, TimeSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Calendar, Sunset, Moon } from "lucide-react";
import { format, addDays } from "date-fns";

const durations: { value: Duration; label: string }[] = [
    { value: 30, label: "30 Minutes" },
    { value: 60, label: "1 Hour" },
];

const timeSlots: { value: TimeSlot; label: string; icon: React.ReactNode }[] = [
    { value: "7:00 PM - 8:00 PM", label: "7:00 PM – 8:00 PM", icon: <Sunset className="w-4 h-4" /> },
    { value: "10:00 PM - 11:00 PM", label: "10:00 PM – 11:00 PM", icon: <Moon className="w-4 h-4" /> },
];

function generateDates(): { value: string; label: string }[] {
    const dates: { value: string; label: string }[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
        const date = addDays(today, i);
        dates.push({
            value: format(date, "yyyy-MM-dd"),
            label: format(date, "EEE, MMM dd, yyyy"),
        });
    }
    return dates;
}

export default function SchedulePage() {
    const router = useRouter();
    const { formData, updateFormData, setCurrentStep } = useBooking();
    const [selectedDuration, setSelectedDuration] = useState<Duration | null>(formData.duration);
    const [selectedDate, setSelectedDate] = useState<string>(formData.consultationDate || "");
    const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(formData.consultationTime);

    const dates = generateDates();

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

    return (
        <>
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

                    {/* Date */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                            <Calendar className="w-4 h-4 text-gold-600" />
                            Consultation Date
                        </label>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-gray-800 focus:border-gold-500 focus:outline-none transition-colors duration-300 appearance-none cursor-pointer"
                        >
                            <option value="">Select a date...</option>
                            {dates.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Slot */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                            <Clock className="w-4 h-4 text-gold-600" />
                            Time Slot
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot.value}
                                    onClick={() => setSelectedTime(slot.value)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                                        "hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10",
                                        "active:scale-[0.98]",
                                        selectedTime === slot.value
                                            ? "border-gold-500 bg-gold-50"
                                            : "border-cream-400/60 bg-cream-50"
                                    )}
                                >
                                    <span className="text-gold-600">{slot.icon}</span>
                                    <span className="text-gray-800 font-medium">{slot.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

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
        </>
    );
}
