"use client";

import { useEffect, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Clock,
    Loader2,
    Activity,
} from "lucide-react";

interface Stats {
    totalBookings: number;
    totalRevenue: number;
    totalDiscount: number;
    upcomingCount: number;
    completedCount: number;
    cancelledCount: number;
    uniqueClients: number;
    repeatClients: number;
}

interface Charts {
    revenueByMonth: Record<string, number>;
    bookingsByMonth: Record<string, number>;
    timeSlotCounts: Record<string, number>;
    typeCounts: Record<string, number>;
    durationCounts: Record<string, number>;
    dayOfWeekCounts: Record<string, number>;
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 text-right truncate">{label}</span>
            <div className="flex-1 h-6 bg-cream-100 rounded-lg overflow-hidden relative">
                <div
                    className={`h-full rounded-lg transition-all duration-500 ${color}`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                    {value}
                </span>
            </div>
        </div>
    );
}

function PieChart({ data, colors }: { data: Record<string, number>; colors: string[] }) {
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    if (total === 0) return <p className="text-xs text-cream-500 text-center py-4">No data</p>;

    const entries = Object.entries(data);
    let startAngle = 0;
    const radius = 50;
    const cx = 60;
    const cy = 60;

    const paths = entries.map(([, value], i) => {
        const angle = (value / total) * 360;
        const endAngle = startAngle + angle;
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);
        const largeArc = angle > 180 ? 1 : 0;

        const d = entries.length === 1
            ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
            : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

        startAngle = endAngle;
        return <path key={i} d={d} fill={colors[i % colors.length]} />;
    });

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 120 120" className="w-28 h-28">{paths}</svg>
            <div className="space-y-1">
                {entries.map(([key, value], i) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-gray-600">{key}: {value} ({Math.round((value / total) * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [charts, setCharts] = useState<Charts | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                const data = await res.json();
                setStats(data.stats);
                setCharts(data.charts);
            } catch {
                console.error("Failed to fetch analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    if (!stats || !charts) return null;

    const monthMax = Math.max(...Object.values(charts.revenueByMonth), 1);
    const timeMax = Math.max(...Object.values(charts.timeSlotCounts), 1);
    const dayMax = Math.max(...Object.values(charts.dayOfWeekCounts), 1);

    return (
        <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-2xl font-serif text-gray-800 mb-6">Analytics</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { icon: BarChart3, label: "Total Bookings", value: stats.totalBookings, color: "text-gray-800" },
                    { icon: DollarSign, label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, color: "text-gold-600" },
                    { icon: Users, label: "Unique Clients", value: stats.uniqueClients, color: "text-blue-600" },
                    { icon: TrendingUp, label: "Repeat Clients", value: stats.repeatClients, color: "text-green-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-cream-400/50 shadow-sm text-center">
                        <s.icon className="w-5 h-5 mx-auto text-cream-400 mb-1" />
                        <p className="text-xs text-cream-600 mb-1">{s.label}</p>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: "Upcoming", value: stats.upcomingCount, color: "text-blue-600" },
                    { label: "Completed", value: stats.completedCount, color: "text-green-600" },
                    { label: "Cancelled", value: stats.cancelledCount, color: "text-red-600" },
                    { label: "Total Discounts", value: `₹${stats.totalDiscount.toLocaleString("en-IN")}`, color: "text-purple-600" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-3 border border-cream-400/50 shadow-sm text-center">
                        <p className="text-xs text-cream-600">{s.label}</p>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue by Month */}
                <div className="bg-white rounded-xl border border-cream-400/50 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gold-600" /> Revenue by Month
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(charts.revenueByMonth).length === 0 ? (
                            <p className="text-xs text-cream-500">No data yet</p>
                        ) : (
                            Object.entries(charts.revenueByMonth)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([month, value]) => (
                                    <Bar key={month} label={month} value={value} max={monthMax} color="bg-gold-400" />
                                ))
                        )}
                    </div>
                </div>

                {/* Popular Time Slots */}
                <div className="bg-white rounded-xl border border-cream-400/50 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" /> Popular Time Slots
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(charts.timeSlotCounts).length === 0 ? (
                            <p className="text-xs text-cream-500">No data yet</p>
                        ) : (
                            Object.entries(charts.timeSlotCounts)
                                .sort(([, a], [, b]) => b - a)
                                .map(([slot, value]) => (
                                    <Bar key={slot} label={slot} value={value} max={timeMax} color="bg-blue-400" />
                                ))
                        )}
                    </div>
                </div>

                {/* Consultation Types */}
                <div className="bg-white rounded-xl border border-cream-400/50 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" /> Consultation Types
                    </h3>
                    <PieChart data={charts.typeCounts} colors={["#C9A227", "#7C3AED"]} />
                </div>

                {/* Duration Distribution */}
                <div className="bg-white rounded-xl border border-cream-400/50 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" /> Duration Split
                    </h3>
                    <PieChart data={charts.durationCounts} colors={["#059669", "#0EA5E9"]} />
                </div>

                {/* Bookings by Day */}
                <div className="bg-white rounded-xl border border-cream-400/50 p-5 shadow-sm md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" /> Bookings by Day of Week
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(charts.dayOfWeekCounts).length === 0 ? (
                            <p className="text-xs text-cream-500">No data yet</p>
                        ) : (
                            Object.entries(charts.dayOfWeekCounts).map(([day, value]) => (
                                <Bar key={day} label={day} value={value} max={dayMax} color="bg-green-400" />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
