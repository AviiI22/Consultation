"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import { BtrOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Star, Sparkles } from "lucide-react";

const options: { type: BtrOption; title: string; description: string; icon: React.ReactNode }[] = [
    {
        type: "without-btr",
        title: "Without Birth Time Rectification",
        description: "Standard consultation using the birth time you provide. Suitable when you know your exact birth time.",
        icon: <Star className="w-8 h-8" />,
    },
    {
        type: "with-btr",
        title: "With Birth Time Rectification",
        description: "Includes birth time correction using advanced techniques. Recommended if your birth time is uncertain.",
        icon: <Sparkles className="w-8 h-8" />,
    },
];

export default function BtrOptionPage() {
    const router = useRouter();
    const { formData, updateFormData, setCurrentStep } = useBooking();

    const handleSelect = (type: BtrOption) => {
        updateFormData({ btrOption: type });
        setCurrentStep(4);
        router.push("/schedule");
    };

    return (
        <>
            <Stepper currentStep={3} />
            <StepCard
                title="Birth Time Rectification"
                subtitle="Would you like to include birth time rectification?"
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
                                formData.btrOption === option.type
                                    ? "border-gold-500 bg-gold-50 shadow-lg shadow-gold-500/10"
                                    : "border-cream-400/60 bg-cream-50 hover:bg-cream-100"
                            )}
                        >
                            <div
                                className={cn(
                                    "mb-4 transition-colors duration-300",
                                    formData.btrOption === option.type
                                        ? "text-gold-600"
                                        : "text-cream-700 group-hover:text-gold-500"
                                )}
                            >
                                {option.icon}
                            </div>
                            <h3 className="font-serif text-lg text-gray-800 mb-2">{option.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{option.description}</p>
                        </button>
                    ))}
                </div>
            </StepCard>
        </>
    );
}
