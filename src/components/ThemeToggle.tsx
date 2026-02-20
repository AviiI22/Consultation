"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-slate-900 border border-white/20 dark:border-slate-800 transition-all"
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? (
                <Sun className="w-5 h-5 text-gold-400" />
            ) : (
                <Moon className="w-5 h-5 text-gray-600" />
            )}
        </button>
    );
}
