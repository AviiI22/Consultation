"use client";

import { Box, Loader2 } from "lucide-react";
import { useState } from "react";

interface ServicePackage {
    id: string;
    name: string;
    description: string;
    sessionCount: number;
    price: number;
    isActive: boolean;
}

interface PackagesTabProps {
    packages: ServicePackage[];
    onRefresh: () => void;
    showToast: (message: string, type: "success" | "error") => void;
}

export function PackagesTab({ packages, onRefresh, showToast }: PackagesTabProps) {
    const [modal, setModal] = useState(false);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [sessions, setSessions] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !sessions || !price) {
            showToast("Please fill all fields.", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/admin/packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description: desc,
                    sessionCount: sessions,
                    price,
                }),
            });
            if (res.ok) {
                await onRefresh();
                setModal(false);
                setName(""); setDesc(""); setSessions(""); setPrice("");
                showToast("Package created!", "success");
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to create package", "error");
            }
        } catch {
            showToast("Failed to create package", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-cream-400/50">
                <h2 className="text-lg font-serif text-gray-800 flex items-center gap-2">
                    <Box className="w-5 h-5 text-gold-600" /> Service Packages
                </h2>
                <button
                    onClick={() => setModal(true)}
                    className="px-4 py-2 rounded-lg bg-gold-600 text-white text-sm font-medium"
                >
                    + Create Package
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white border border-cream-400/50 p-5 rounded-xl shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                            <span className="text-gold-600 font-bold text-lg">₹{pkg.price}</span>
                        </div>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-cream-600">
                            <span className="bg-cream-100 px-2 py-1 rounded">{pkg.sessionCount} Sessions</span>
                            <span className={pkg.isActive ? "text-green-600" : "text-red-600"}>
                                {pkg.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Package Creation Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                            <Box className="w-5 h-5 text-gold-600" /> Create Package
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                                    placeholder="e.g. Silver Package" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
                                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 resize-none"
                                    placeholder="Package description..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sessions</label>
                                    <input type="number" value={sessions} onChange={(e) => setSessions(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                                        placeholder="3" min="1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
                                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                                        placeholder="5999" min="1" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl bg-gold-600 text-white text-sm font-semibold hover:bg-gold-500 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {loading ? "Creating..." : "Create Package"}
                            </button>
                            <button
                                onClick={() => setModal(false)}
                                className="px-6 py-3 rounded-xl bg-cream-100 text-cream-700 text-sm font-semibold hover:bg-cream-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
