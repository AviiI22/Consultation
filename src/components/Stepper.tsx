"use client";

import { STEPS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StepperProps {
    currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-cream-400" />
                {/* Progress line filled */}
                <div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-700 ease-out"
                    style={{
                        width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                    }}
                />

                {STEPS.map((step) => (
                    <div key={step.number} className="flex flex-col items-center relative z-10">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 border-2",
                                step.number < currentStep
                                    ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/20"
                                    : step.number === currentStep
                                        ? "bg-white border-gold-500 text-gold-600 shadow-md shadow-gold-500/15 animate-pulse-gold"
                                        : "bg-cream-200 border-cream-400 text-cream-600"
                            )}
                        >
                            {step.number < currentStep ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step.number
                            )}
                        </div>
                        <span
                            className={cn(
                                "mt-2 text-xs font-medium transition-colors duration-300 hidden sm:block",
                                step.number <= currentStep ? "text-gold-600" : "text-cream-600"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
