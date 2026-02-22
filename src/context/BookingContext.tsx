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
    currency: string;
    setCurrency: (c: string) => void;
    isLoaded: boolean;
    pricing: {
        inrNormal40: number;
        inrUrgent40: number;
        inrNormal90: number;
        inrUrgent90: number;
        inrBtr: number;
    };
    rates: Record<string, number>;
    convertPrice: (inrAmount: number, targetCurrency: string) => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<BookingFormData>(initialState);
    const [currentStep, setCurrentStep] = useState(1);
    const [currency, setCurrency] = useState<string>("INR");
    const [isLoaded, setIsLoaded] = useState(false);
    const [pricing, setPricing] = useState({
        inrNormal40: 2499,
        inrUrgent40: 4999,
        inrNormal90: 4500,
        inrUrgent90: 8000,
        inrBtr: 2500,
    });
    const [rates, setRates] = useState<Record<string, number>>({ INR: 87.5 }); // Fallback rate

    // Load state from localStorage on mount
    React.useEffect(() => {
        const fetchPricingAndRates = async () => {
            try {
                // Fetch Pricing
                const pricingRes = await fetch("/api/pricing");
                const pricingData = await pricingRes.json();
                if (pricingRes.ok && pricingData.pricing) {
                    setPricing(pricingData.pricing);
                }

                // Fetch Rates
                const ratesRes = await fetch("/api/currency/rates");
                const ratesData = await ratesRes.json();
                if (ratesRes.ok && ratesData.rates) {
                    setRates(ratesData.rates);
                }
            } catch (error) {
                console.error("Failed to fetch startup data:", error);
            }
        };

        fetchPricingAndRates();

        const savedFormData = localStorage.getItem("booking_formData");
        const savedStep = localStorage.getItem("booking_currentStep");
        const savedCurrency = localStorage.getItem("booking_currency");

        if (savedFormData) setFormData(JSON.parse(savedFormData));
        if (savedStep) setCurrentStep(parseInt(savedStep));
        // Only set saved currency if it's not "USD" or if we want to allow persistent currency
        if (savedCurrency) setCurrency(savedCurrency);

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

    const convertPrice = (inrAmount: number, targetCurrency: string) => {
        if (targetCurrency === "INR") return inrAmount;
        const rate = rates[targetCurrency];
        if (!rate) {
            // If it's USD and rate is missing (unlikely), use a safe fallback or return original
            // but since INR is base, USD rate should be in the rates object (e.g. 0.012)
            return inrAmount;
        }
        return Math.round(inrAmount * rate);
    };

    return (
        <BookingContext.Provider
            value={{
                formData,
                updateFormData,
                resetFormData,
                currentStep,
                setCurrentStep,
                currency,
                setCurrency,
                isLoaded,
                pricing,
                rates,
                convertPrice
            }}
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
