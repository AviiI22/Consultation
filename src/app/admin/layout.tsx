"use client";

import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <div className="min-h-screen">
                {children}
            </div>
        </SessionProvider>
    );
}
