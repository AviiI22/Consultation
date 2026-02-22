"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Save,
    Loader2,
    IndianRupee,
    Clock,
    Zap,
    AlertCircle,
    CheckCircle2,
    RefreshCw
} from "lucide-react";

interface PricingData {
    inrNormal40: number;
    inrUrgent40: number;
    inrNormal90: number;
    inrUrgent90: number;
    inrBtr: number;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [formData, setFormData] = useState<PricingData>({
        inrNormal40: 2499,
        inrUrgent40: 4999,
        inrNormal90: 4500,
        inrUrgent90: 8000,
        inrBtr: 2500,
    });

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/pricing");
            const data = await res.json();
            if (res.ok && data.pricing) {
                const { id, updatedAt, ...cleanPricing } = data.pricing;
                setFormData({
                    inrNormal40: cleanPricing.inrNormal40 || 2499,
                    inrUrgent40: cleanPricing.inrUrgent40 || 4999,
                    inrNormal90: cleanPricing.inrNormal90 || 4500,
                    inrUrgent90: cleanPricing.inrUrgent90 || 8000,
                    inrBtr: cleanPricing.inrBtr || 2500,
                });
            }
        } catch (error) {
            console.error("Failed to fetch pricing:", error);
            setStatus({ type: "error", message: "Failed to load current prices" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const res = await fetch("/api/admin/pricing", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus({ type: "success", message: "Prices updated successfully" });
                setTimeout(() => setStatus(null), 3000);
            } else {
                const data = await res.json();
                setStatus({ type: "error", message: data.error || "Failed to save prices" });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: keyof PricingData, value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, [key]: numValue }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-cream-700">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Loading pricing data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Manage Pricing</h1>
                    <p className="text-gray-500 text-sm">Set your base INR prices for each consultation duration.</p>
                </div>
                <button
                    onClick={fetchPricing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-cream-700 hover:text-gold-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${status.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                    {status.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 40 Min Section */}
                    <div className="bg-white rounded-2xl border border-cream-400/50 overflow-hidden shadow-sm">
                        <div className="bg-cream-50 px-6 py-4 border-b border-cream-400/50 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gold-600" />
                            <h2 className="font-semibold text-gray-900">40 Minute Consultation</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                    Normal Pricing
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={formData.inrNormal40}
                                        onChange={(e) => handleChange("inrNormal40", e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-cream-50 border border-cream-400/60 rounded-xl focus:outline-none focus:border-gold-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-red-500" /> Urgent Pricing
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={formData.inrUrgent40}
                                        onChange={(e) => handleChange("inrUrgent40", e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-cream-50 border border-cream-400/60 rounded-xl focus:outline-none focus:border-gold-500 transition-all font-medium text-red-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 90 Min Section */}
                    <div className="bg-white rounded-2xl border border-cream-400/50 overflow-hidden shadow-sm">
                        <div className="bg-cream-50 px-6 py-4 border-b border-cream-400/50 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h2 className="font-semibold text-gray-900">1 Hour 30 Minute Consultation</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Normal Pricing</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={formData.inrNormal90}
                                        onChange={(e) => handleChange("inrNormal90", e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-cream-50 border border-cream-400/60 rounded-xl focus:outline-none focus:border-gold-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-red-500" /> Urgent Pricing
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={formData.inrUrgent90}
                                        onChange={(e) => handleChange("inrUrgent90", e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-cream-50 border border-cream-400/60 rounded-xl focus:outline-none focus:border-gold-500 transition-all font-medium text-red-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BTR Add-on Section */}
                <div className="bg-white rounded-2xl border border-gold-500/20 overflow-hidden shadow-sm max-w-md">
                    <div className="bg-gold-50/50 px-6 py-4 border-b border-gold-500/10 flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-gold-600" />
                        <h2 className="font-semibold text-gray-900">BTR Consultation Add-on</h2>
                    </div>
                    <div className="p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 text-xs uppercase tracking-wider">Additional Fee (INR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                                type="number"
                                value={formData.inrBtr}
                                onChange={(e) => handleChange("inrBtr", e.target.value)}
                                className="w-full pl-8 pr-4 py-2 bg-cream-50/50 border border-cream-400/60 rounded-xl focus:outline-none focus:border-gold-500 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 italic">* This amount is added to the base consultation fee when BTR is selected.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-white font-semibold transition-all hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Prices
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
