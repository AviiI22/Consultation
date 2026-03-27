"use client";

import { Megaphone } from "lucide-react";
import { useState } from "react";

interface AnnouncementModalProps {
    open: boolean;
    onClose: () => void;
    showToast: (message: string, type: "success" | "error") => void;
}

export function AnnouncementModal({ open, onClose, showToast }: AnnouncementModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSend = async () => {
        if (!subject || !message) {
            showToast("Please fill in subject and message.", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/admin/announcements/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message }),
            });
            const data = await res.json();
            showToast(data.message || data.error, res.ok ? "success" : "error");
            if (res.ok) {
                setSubject("");
                setMessage("");
                onClose();
            }
        } catch {
            showToast("Failed to send.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-serif text-gray-800 mb-3 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-gold-600" /> Bulk Announcement
                </h3>
                <p className="text-xs text-gray-500 mb-4">Send an email to all unique clients in the system.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                            placeholder="e.g. Special Holiday Discount!"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 resize-none"
                            placeholder="Write your announcement here..."
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-gold-600 text-white text-sm font-semibold hover:bg-gold-500 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send to All Clients"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-cream-100 text-cream-700 text-sm font-semibold hover:bg-cream-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
