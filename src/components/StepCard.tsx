"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StepCardProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
}

export default function StepCard({ children, title, subtitle, className }: StepCardProps) {
    return (
        <div
            className={cn(
                "w-full max-w-2xl mx-auto animate-fade-in",
                className
            )}
        >
            <div className="relative rounded-2xl border border-cream-400/60 bg-white/90 backdrop-blur-xl shadow-lg shadow-gold-500/5 overflow-hidden">
                {/* Gold accent line at top */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-shimmer bg-[length:200%_100%] animate-shimmer" />

                <div className="p-8 sm:p-10">
                    <h2 className="font-serif text-2xl sm:text-3xl text-gold-700 mb-2">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-cream-700 text-sm mb-8">{subtitle}</p>
                    )}
                    {!subtitle && <div className="mb-8" />}
                    {children}
                </div>
            </div>
        </div>
    );
}
