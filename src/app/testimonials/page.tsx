"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Send, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Testimonial {
    id: string;
    name: string;
    rating: number;
    text: string;
    createdAt: string;
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");

    useEffect(() => {
        fetch("/api/testimonials")
            .then((r) => r.json())
            .then((d) => setTestimonials(d.testimonials || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (!name.trim() || !text.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, rating, text }),
            });
            if (res.ok) {
                setSubmitted(true);
                setName("");
                setText("");
                setRating(5);
            }
        } catch {
            alert("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-100">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-300/50">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="font-serif text-lg text-gold-gradient tracking-wide">
                        ✦ Astrology Consultation
                    </Link>
                    <Link
                        href="/book"
                        className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-all"
                    >
                        Book Now
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-10">
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-cream-600 hover:text-gold-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-3">
                        Client <span className="text-gold-gradient">Reviews</span>
                    </h1>
                    <p className="text-gray-500">What our clients say about their experience</p>
                </div>

                {/* Submit Review Button */}
                {!showForm && !submitted && (
                    <div className="text-center mb-8">
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-gold-500/20"
                        >
                            <Send className="w-4 h-4" /> Share Your Experience
                        </button>
                    </div>
                )}

                {/* Submission Form */}
                {showForm && !submitted && (
                    <div className="bg-white rounded-2xl border border-cream-400/50 p-6 mb-8 shadow-sm">
                        <h2 className="text-lg font-serif font-semibold text-gray-800 mb-4">Share Your Experience</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <button key={r} onClick={() => setRating(r)}>
                                            <Star
                                                className={`w-6 h-6 transition-colors ${r <= rating ? "text-gold-500 fill-gold-500" : "text-gray-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Your Review</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Tell us about your consultation experience..."
                                    rows={4}
                                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !name.trim() || !text.trim()}
                                    className="flex-1 py-3 rounded-xl bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Submit Review
                                </button>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-3 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success */}
                {submitted && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-green-800 mb-1">Thank you!</h3>
                        <p className="text-sm text-green-600">Your review has been submitted and will be visible after approval.</p>
                    </div>
                )}

                {/* Testimonials Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto" />
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="text-center py-12 text-cream-500">
                        No reviews yet. Be the first to share your experience!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {testimonials.map((t) => (
                            <div
                                key={t.id}
                                className="rounded-2xl bg-white border border-cream-300/50 p-5 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex gap-0.5 mb-3">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < t.rating ? "text-gold-500 fill-gold-500" : "text-gray-200"}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
                                <p className="text-xs font-medium text-gray-800">— {t.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
