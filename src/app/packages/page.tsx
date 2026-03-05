"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle, Loader2, Star } from "lucide-react";

interface ServicePackage {
    id: string;
    name: string;
    description: string | null;
    sessionCount: number;
    price: number;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/packages")
            .then((r) => r.json())
            .then((d) => setPackages(d.packages || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const perSessionPrice = (pkg: ServicePackage) =>
        Math.round(pkg.price / pkg.sessionCount).toLocaleString("en-IN");

    return (
        <div className="min-h-screen bg-cream-100">
            <header className="sticky top-0 z-30 bg-cream-100/80 backdrop-blur-xl border-b border-cream-300/50">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="font-serif text-lg text-gold-gradient tracking-wide">✦ Astrology Consultation</Link>
                    <Link href="/book" className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-semibold transition-all">Book Single Session</Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-cream-600 hover:text-gold-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="text-center mb-12">
                    <p className="text-sm text-gold-600 font-medium tracking-widest uppercase mb-3">Save More</p>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                        Multi-Session <span className="text-gold-gradient">Packages</span>
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Purchase a bundle of sessions at a discounted rate. Perfect for ongoing guidance and deeper astrological insights.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-12 h-12 text-cream-400 mx-auto mb-4" />
                        <h2 className="text-xl font-serif text-gray-600 mb-2">No packages available yet</h2>
                        <p className="text-gray-400 text-sm">Check back soon, or book a single session for now.</p>
                        <Link href="/book" className="inline-block mt-6 px-6 py-3 rounded-xl bg-gold-500 text-white font-semibold hover:bg-gold-400 transition-all">
                            Book a Session
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg, i) => {
                            const isPopular = i === 1 || packages.length === 1;
                            return (
                                <div
                                    key={pkg.id}
                                    className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${isPopular
                                            ? "border-gold-400 bg-white shadow-lg shadow-gold-500/10"
                                            : "border-cream-300/60 bg-white/80"
                                        }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-gold-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-white" /> Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPopular ? "bg-gold-100" : "bg-cream-100"}`}>
                                            <Package className={`w-5 h-5 ${isPopular ? "text-gold-600" : "text-cream-600"}`} />
                                        </div>
                                        <div>
                                            <h2 className="font-serif font-bold text-gray-900">{pkg.name}</h2>
                                            <p className="text-xs text-gray-400">{pkg.sessionCount} sessions included</p>
                                        </div>
                                    </div>

                                    {pkg.description && (
                                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{pkg.description}</p>
                                    )}

                                    <div className="flex items-end gap-2 mb-4">
                                        <span className="text-3xl font-bold font-serif text-gray-800">₹{pkg.price.toLocaleString("en-IN")}</span>
                                        <span className="text-sm text-gray-400 mb-1">total</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-5 rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        <span className="text-xs text-green-700 font-medium">
                                            ₹{perSessionPrice(pkg)} per session (save vs. individual booking)
                                        </span>
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-3.5 h-3.5 text-gold-500" />
                                            {pkg.sessionCount} × 40-minute sessions
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-gold-500" />
                                            Valid for 6 months from purchase
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-gold-500" />
                                            Priority scheduling
                                        </li>
                                    </ul>

                                    <Link
                                        href={`mailto:work.astro.avii@gmail.com?subject=Package%20Purchase%20-%20${encodeURIComponent(pkg.name)}&body=Hi%2C%20I%20would%20like%20to%20purchase%20the%20${encodeURIComponent(pkg.name)}%20(${pkg.sessionCount}%20sessions%20for%20%E2%82%B9${pkg.price}).%0A%0APlease%20share%20the%20payment%20details.`}
                                        className={`block w-full py-3 text-center rounded-xl font-semibold text-sm transition-all duration-300 ${isPopular
                                                ? "bg-gold-500 hover:bg-gold-400 text-white hover:shadow-lg hover:shadow-gold-500/20"
                                                : "border-2 border-gold-300 text-gold-700 hover:bg-gold-50"
                                            }`}
                                    >
                                        Get This Package
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <p className="text-xs text-gray-400">
                        Have questions? Email{" "}
                        <a href="mailto:work.astro.avii@gmail.com" className="text-gold-600 hover:underline">
                            work.astro.avii@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
