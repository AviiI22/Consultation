"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { BookingFormData } from "@/lib/types";

const initialState: BookingFormData = {
    consultationType: null,
    btrOption: null,
    duration: null,
    consultationDate: null,
    consultationTime: null,
    name: "",
    dob: "",
    tob: "",
    gender: null,
    email: "",
    phone: "",
    birthPlace: "",
    concern: "",
    promoCode: null,
    discountPercent: 0,
};

interface BookingContextType {
    formData: BookingFormData;
    updateFormData: (data: Partial<BookingFormData>) => void;
    resetFormData: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    currency: "INR" | "USD";
    setCurrency: (c: "INR" | "USD") => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<BookingFormData>(initialState);
    const [currentStep, setCurrentStep] = useState(1);
    const [currency, setCurrency] = useState<"INR" | "USD">("INR");

    // Auto-detect timezone
    React.useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setFormData((prev) => ({ ...prev, userTimezone: tz }));
    }, []);

    const updateFormData = (data: Partial<BookingFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const resetFormData = () => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setFormData({ ...initialState, userTimezone: tz });
        setCurrentStep(1);
    };

    return (
        <BookingContext.Provider
            value={{ formData, updateFormData, resetFormData, currentStep, setCurrentStep, currency, setCurrency }}
        >
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBooking must be used within a BookingProvider");
    }
    return context;
}
