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
    isLoaded: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<BookingFormData>(initialState);
    const [currentStep, setCurrentStep] = useState(1);
    const [currency, setCurrency] = useState<"INR" | "USD">("INR");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from localStorage on mount
    React.useEffect(() => {
        const savedFormData = localStorage.getItem("booking_formData");
        const savedStep = localStorage.getItem("booking_currentStep");
        const savedCurrency = localStorage.getItem("booking_currency");

        if (savedFormData) setFormData(JSON.parse(savedFormData));
        if (savedStep) setCurrentStep(parseInt(savedStep));
        if (savedCurrency) setCurrency(savedCurrency as "INR" | "USD");

        // Auto-detect timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setFormData((prev) => ({ ...prev, userTimezone: tz }));

        setIsLoaded(true);
    }, []);

    // Persist state to localStorage on changes
    React.useEffect(() => {
        if (formData !== initialState) {
            localStorage.setItem("booking_formData", JSON.stringify(formData));
        }
    }, [formData]);

    React.useEffect(() => {
        localStorage.setItem("booking_currentStep", currentStep.toString());
    }, [currentStep]);

    React.useEffect(() => {
        localStorage.setItem("booking_currency", currency);
    }, [currency]);

    const updateFormData = (data: Partial<BookingFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const resetFormData = () => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setFormData({ ...initialState, userTimezone: tz });
        setCurrentStep(1);
        localStorage.removeItem("booking_formData");
        localStorage.removeItem("booking_currentStep");
        localStorage.removeItem("booking_currency");
    };

    return (
        <BookingContext.Provider
            value={{ formData, updateFormData, resetFormData, currentStep, setCurrentStep, currency, setCurrency, isLoaded }}
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
