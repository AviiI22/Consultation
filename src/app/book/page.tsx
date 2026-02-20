"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import StepCard from "@/components/StepCard";
import Stepper from "@/components/Stepper";
import BookingLayout from "@/components/BookingLayout";
import { Shield, Lock, FileCheck } from "lucide-react";

export default function BookTermsPage() {
    const router = useRouter();
    const { setCurrentStep } = useBooking();

    const handleAgree = () => {
        setCurrentStep(2);
        router.push("/consultation-type");
    };

    return (
        <BookingLayout>
            <Stepper currentStep={1} />
            <StepCard
                title="Terms & Conditions"
                subtitle="Please review and accept before proceeding"
            >
                <div className="space-y-6">
                    <div className="rounded-xl bg-cream-200/60 border border-cream-400/50 p-6 space-y-4 text-sm text-gray-600 leading-relaxed max-h-80 overflow-y-auto">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                            <p>
                                Welcome to our Astrology Consultation platform. By proceeding, you
                                acknowledge and agree to the following terms regarding the use of
                                your personal data.
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gold-700 mb-1">Data Security</p>
                                <p>
                                    Your birth details, contact information, and consultation data
                                    will be stored securely and encrypted. We use industry-standard
                                    security measures to protect your personal information.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <FileCheck className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gold-700 mb-1">Purpose of Data Collection</p>
                                <p>
                                    The information you provide will be used solely for the purpose
                                    of conducting your astrology consultation. This includes your
                                    birth details (date, time, and place of birth), which are
                                    essential for accurate astrological analysis.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-cream-400/50 pt-4">
                            <p className="text-gray-500 text-xs">
                                By clicking &quot;OK, I AGREE&quot; below, you consent to the collection
                                and processing of your personal data as described above. You may
                                request deletion of your data at any time by contacting our support
                                team.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleAgree}
                        className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
                    >
                        OK, I AGREE
                    </button>

                    <p className="text-center text-gray-400 text-xs">
                        You must accept the terms to proceed with booking
                    </p>
                </div>
            </StepCard>
        </BookingLayout>
    );
}
