"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import { ConsultationType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Zap } from "lucide-react";

const options: { type: ConsultationType; title: string; description: string; icon: React.ReactNode }[] = [
    {
        type: "normal",
        title: "Normal Consultation",
        description: "Schedule your consultation at a convenient time. Ideal for detailed, in-depth astrological analysis.",
        icon: <Clock className="w-8 h-8" />,
    },
    {
        type: "urgent",
        title: "Urgent Consultation",
        description: "Need answers quickly? Get a consultation within the next 2 hours for pressing concerns.",
        icon: <Zap className="w-8 h-8" />,
    },
];

export default function ConsultationTypePage() {
    const router = useRouter();
    const { formData, updateFormData, setCurrentStep } = useBooking();

    const handleSelect = (type: ConsultationType) => {
        updateFormData({ consultationType: type });
        setCurrentStep(3);
        router.push("/btr-option");
    };

    return (
        <>
            <Stepper currentStep={2} />
            <StepCard
                title="Choose Consultation Type"
                subtitle="Select the type of consultation that suits your needs"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {options.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => handleSelect(option.type)}
                            className={cn(
                                "group relative p-6 rounded-xl border-2 text-left transition-all duration-300",
                                "hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-1",
                                "active:scale-[0.98]",
                                formData.consultationType === option.type
                                    ? "border-gold-500 bg-gold-50 shadow-lg shadow-gold-500/10"
                                    : "border-cream-400/60 bg-cream-50 hover:bg-cream-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "mb-4 transition-colors duration-300",
                                    formData.consultationType === option.type
                                        ? "text-gold-600"
                                        : "text-cream-700 group-hover:text-gold-500"
                                )}
                            >
                                {option.icon}
                            </div>
                            <h3 className="font-serif text-lg text-gray-800 mb-2">{option.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{option.description}</p>
                            {option.type === "urgent" && (
                                <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-50 border border-red-200 text-red-500 text-xs rounded-full">
                                    Priority
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </StepCard>
        </>
    );
}
