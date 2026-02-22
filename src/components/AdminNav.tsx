"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    CalendarCog,
    BarChart3,
    Tag,
    Star,
    LogOut,
    IndianRupee,
} from "lucide-react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/availability", label: "Availability", icon: CalendarCog },
    { href: "/admin/pricing", label: "Pricing", icon: IndianRupee },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
    { href: "/admin/testimonials", label: "Testimonials", icon: Star },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="bg-white border-b border-cream-400/50 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link
                        href="/admin"
                        className="font-serif text-lg text-gold-gradient tracking-wide flex-shrink-0"
                    >
                        ✦ Admin
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/admin" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                        ? "bg-gold-100 text-gold-700 border border-gold-200"
                                        : "text-cream-700 hover:text-gray-700 hover:bg-cream-100"
                                        }`}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cream-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
