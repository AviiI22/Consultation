"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";

interface Testimonial {
    id: string;
    name: string;
    rating: number;
    text: string;
    isApproved: boolean;
    createdAt: string;
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const res = await fetch("/api/admin/testimonials");
            const data = await res.json();
            setTestimonials(data.testimonials || []);
        } catch {
            console.error("Failed to fetch");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const toggleApproval = async (id: string, isApproved: boolean) => {
        await fetch("/api/admin/testimonials", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isApproved: !isApproved }),
        });
        fetchAll();
    };

    const deleteTestimonial = async (id: string) => {
        await fetch("/api/admin/testimonials", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        fetchAll();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    const pending = testimonials.filter((t) => !t.isApproved);
    const approved = testimonials.filter((t) => t.isApproved);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-serif text-gray-800 mb-6">Testimonials</h1>

            {/* Pending */}
            {pending.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-semibold text-amber-700 mb-3">⏳ Pending Approval ({pending.length})</h2>
                    <div className="space-y-3">
                        {pending.map((t) => (
                            <div key={t.id} className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">{t.name}</span>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < t.rating ? "text-gold-500 fill-gold-500" : "text-gray-300"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleApproval(t.id, t.isApproved)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                        >
                                            <CheckCircle2 className="w-3 h-3" /> Approve
                                        </button>
                                        <button
                                            onClick={() => deleteTestimonial(t.id)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{t.text}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Approved */}
            <section>
                <h2 className="text-sm font-semibold text-green-700 mb-3">✅ Approved ({approved.length})</h2>
                {approved.length === 0 ? (
                    <p className="text-xs text-cream-500">No approved testimonials yet.</p>
                ) : (
                    <div className="space-y-3">
                        {approved.map((t) => (
                            <div key={t.id} className="bg-white rounded-xl border border-cream-400/50 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">{t.name}</span>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < t.rating ? "text-gold-500 fill-gold-500" : "text-gray-300"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleApproval(t.id, t.isApproved)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                        >
                                            <XCircle className="w-3 h-3" /> Unapprove
                                        </button>
                                        <button
                                            onClick={() => deleteTestimonial(t.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{t.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
