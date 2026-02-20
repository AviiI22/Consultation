"use client";

import { SessionProvider } from "next-auth/react";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-cream-100">
                <AdminNav />
                <div className="py-6">{children}</div>
            </div>
        </SessionProvider>
    );
}
