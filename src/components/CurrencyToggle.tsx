"use client";

import { useBooking } from "@/context/BookingContext";

export function CurrencyToggle() {
    const { currency, setCurrency } = useBooking();

    return (
        <div className="flex bg-cream-200 dark:bg-slate-800 p-0.5 rounded-xl border border-cream-300 dark:border-slate-700">
            {(["INR", "USD"] as const).map((c) => (
                <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${currency === c
                        ? "bg-gold-500 text-white shadow-sm"
                        : "text-cream-700 dark:text-slate-400 hover:text-gold-600 dark:hover:text-gold-400"
                        }`}
                >
                    {c}
                </button>
            ))}
        </div>
    );
}
