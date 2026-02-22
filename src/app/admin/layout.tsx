"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    return (
        <SessionProvider>
            <div className="min-h-screen bg-cream-100">
                {!isLoginPage && <AdminNav />}
                <div className={!isLoginPage ? "py-6" : ""}>{children}</div>
            </div>
        </SessionProvider>
    );
}
