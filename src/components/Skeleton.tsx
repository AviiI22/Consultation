"use client";

/**
 * Reusable skeleton/shimmer loading component.
 * Usage: <Skeleton className="h-8 w-32" /> for a single line
 *        <Skeleton className="h-40 w-full rounded-2xl" /> for a card
 */
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 bg-[length:200%_100%] rounded-lg ${className}`}
            style={{
                animation: "shimmer 1.5s ease-in-out infinite",
            }}
        />
    );
}

/**
 * A skeleton card that mimics the booking step card layout.
 */
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-cream-400/50 p-6 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-3 mt-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
            </div>
        </div>
    );
}

/**
 * Skeleton for a price/amount display.
 */
export function SkeletonPrice() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-10" />
        </div>
    );
}
