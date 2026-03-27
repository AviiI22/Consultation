"use client";

interface StatsGridProps {
    totalBookings: number;
    totalClients: number;
}

export function StatsGrid({ totalBookings, totalClients }: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-cream-400/50 shadow-sm">
                <p className="text-xs font-semibold text-cream-600 uppercase">Total Bookings</p>
                <p className="text-3xl font-serif font-bold text-gray-800 mt-1">{totalBookings}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-cream-400/50 shadow-sm">
                <p className="text-xs font-semibold text-cream-600 uppercase">Total Clients</p>
                <p className="text-3xl font-serif font-bold text-gray-800 mt-1">{totalClients}</p>
            </div>
        </div>
    );
}
