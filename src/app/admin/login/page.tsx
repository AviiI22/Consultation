"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, KeyRound, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/admin");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-100 border-2 border-gold-200 mb-4">
                        <Lock className="w-8 h-8 text-gold-700" />
                    </div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-gold-gradient tracking-wide">
                        Admin Portal
                    </h1>
                    <p className="text-cream-700 text-sm mt-2">
                        Sign in to manage your consultations
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl border border-cream-400/50 shadow-lg shadow-gold-200/10 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <Mail className="w-4 h-4 text-gold-600" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@astrology.com"
                                required
                                className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-gray-800 placeholder-cream-600 focus:border-gold-500 focus:outline-none transition-colors duration-300"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                                <KeyRound className="w-4 h-4 text-gold-600" />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full p-3 pr-11 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-gray-800 placeholder-cream-600 focus:border-gold-500 focus:outline-none transition-colors duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-600 hover:text-gold-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading
                                ? "bg-gold-300 text-white cursor-wait"
                                : "bg-gold-500 hover:bg-gold-400 text-white hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-cream-600 text-xs mt-6">
                    ✦ Protected Admin Area ✦
                </p>
            </div>
        </div>
    );
}
