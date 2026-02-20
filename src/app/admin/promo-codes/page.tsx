"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Calendar } from "lucide-react";

interface PromoCode {
    id: string;
    code: string;
    discountPercent: number;
    maxUses: number;
    usedCount: number;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
}

export default function PromoCodesPage() {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState("");
    const [discount, setDiscount] = useState("10");
    const [maxUses, setMaxUses] = useState("100");
    const [expiresAt, setExpiresAt] = useState("");

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/admin/promo-codes");
            const data = await res.json();
            setCodes(data.codes || []);
        } catch {
            console.error("Failed to fetch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const createCode = async () => {
        if (!code.trim()) return;
        const res = await fetch("/api/admin/promo-codes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code,
                discountPercent: discount,
                maxUses,
                expiresAt: expiresAt || null,
            }),
        });
        if (res.ok) {
            setCode("");
            setDiscount("10");
            setMaxUses("100");
            setExpiresAt("");
            fetchCodes();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to create");
        }
    };

    const toggleCode = async (id: string, isActive: boolean) => {
        await fetch("/api/admin/promo-codes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isActive: !isActive }),
        });
        fetchCodes();
    };

    const deleteCode = async (id: string) => {
        await fetch("/api/admin/promo-codes", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetchCodes();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-serif text-gray-800 mb-6">Promo Codes</h1>

            {/* Create */}
            <div className="bg-white rounded-xl border border-cream-400/50 p-5 mb-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-gold-600" /> Create Promo Code
                </h2>
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="DIWALI50"
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500 w-36 uppercase"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Discount %</label>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            min={1}
                            max={100}
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500 w-20"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Max Uses</label>
                        <input
                            type="number"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            min={1}
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500 w-20"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Expires (optional)</label>
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-cream-400/60 text-sm bg-cream-50 focus:outline-none focus:border-gold-500"
                        />
                    </div>
                    <button
                        onClick={createCode}
                        className="px-5 py-2 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors"
                    >
                        Create
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {codes.length === 0 ? (
                    <div className="text-center py-8 text-cream-500">No promo codes created yet.</div>
                ) : (
                    codes.map((c) => (
                        <div
                            key={c.id}
                            className={`bg-white rounded-xl border p-4 shadow-sm flex items-center justify-between flex-wrap gap-3 ${c.isActive ? "border-cream-400/50" : "border-gray-200 opacity-60"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Tag className="w-4 h-4 text-gold-600" />
                                <div>
                                    <span className="font-mono font-bold text-gray-800">{c.code}</span>
                                    <span className="ml-2 text-sm text-purple-600 font-medium">-{c.discountPercent}%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Used: {c.usedCount}/{c.maxUses}</span>
                                {c.expiresAt && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Expires: {c.expiresAt}
                                    </span>
                                )}
                                <button
                                    onClick={() => toggleCode(c.id, c.isActive)}
                                    className="hover:text-gold-600 transition-colors"
                                >
                                    {c.isActive ? (
                                        <ToggleRight className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                <button
                                    onClick={() => deleteCode(c.id)}
                                    className="hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
