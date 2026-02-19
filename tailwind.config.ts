import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    50: "#FFF9E6",
                    100: "#FFF0BF",
                    200: "#FFE699",
                    300: "#FFD966",
                    400: "#DEB746",
                    500: "#C9A227",
                    600: "#A8861E",
                    700: "#866B18",
                    800: "#654F12",
                    900: "#43350C",
                },
                cream: {
                    50: "#FEFDFB",
                    100: "#FAFAF7",
                    200: "#F5F3EE",
                    300: "#EDEADF",
                    400: "#E8E4DB",
                    500: "#DDD8CC",
                    600: "#C4BFAE",
                    700: "#A8A290",
                    800: "#8C8672",
                    900: "#706B5A",
                },
            },
            fontFamily: {
                serif: ["Playfair Display", "Georgia", "serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gold-shimmer":
                    "linear-gradient(135deg, #C9A227 0%, #FFD966 50%, #C9A227 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.6s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "pulse-gold": "pulseGold 2s ease-in-out infinite",
                shimmer: "shimmer 2s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseGold: {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 162, 39, 0.3)" },
                    "50%": { boxShadow: "0 0 15px 5px rgba(201, 162, 39, 0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
