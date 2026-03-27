"use client";

import {
    XCircle,
    Download,
    Megaphone,
    Sparkles,
    Video,
    Wifi,
    WifiOff,
    Loader2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface QuickActionsProps {
    googleConnected: boolean | null;
    actionLoading: string | null;
    onConnectGoogle: () => void;
    onDisconnectGoogle: () => void;
    onRunReminders: () => void;
    onCleanup: () => void;
    onExportBookings: () => void;
    onExportClients: () => void;
    onOpenAnnouncement: () => void;
}

export function QuickActions({
    googleConnected,
    actionLoading,
    onConnectGoogle,
    onDisconnectGoogle,
    onRunReminders,
    onCleanup,
    onExportBookings,
    onExportClients,
    onOpenAnnouncement,
}: QuickActionsProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white p-5 rounded-2xl border border-cream-400/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-cream-600 uppercase">Quick Actions</p>
                {/* Mobile: toggle expand */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="sm:hidden text-cream-500 hover:text-gold-600 transition-colors"
                >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>
            <div className={`flex flex-wrap gap-2 ${!expanded ? "hidden sm:flex" : "flex"}`}>
                {/* Google Calendar Status & Connect */}
                {googleConnected === false ? (
                    <button
                        onClick={onConnectGoogle}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 shadow-sm flex items-center gap-2 transition-all"
                    >
                        <Video className="w-4 h-4" /> Connect Google Calendar
                    </button>
                ) : googleConnected === true ? (
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium flex items-center gap-2">
                            <Wifi className="w-4 h-4" /> Connected
                        </div>
                        <button
                            onClick={onConnectGoogle}
                            className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium hover:bg-blue-100 transition-all flex items-center gap-1.5"
                        >
                            <Video className="w-3.5 h-3.5" /> Reconnect
                        </button>
                        <button
                            onClick={onDisconnectGoogle}
                            disabled={actionLoading === "google-disconnect"}
                            className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <WifiOff className="w-3.5 h-3.5" /> {actionLoading === "google-disconnect" ? "..." : "Disconnect"}
                        </button>
                    </div>
                ) : (
                    <div className="px-4 py-2 rounded-xl bg-gray-50 text-gray-400 border text-sm font-medium flex items-center gap-2">
                        <WifiOff className="w-4 h-4" /> Checking...
                    </div>
                )}
                <button
                    onClick={onRunReminders}
                    disabled={actionLoading === "reminders"}
                    className="px-4 py-2 rounded-xl bg-gold-100 text-gold-700 text-sm font-medium hover:bg-gold-200 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <Sparkles className="w-4 h-4" /> {actionLoading === "reminders" ? "Running..." : "Run Reminders"}
                </button>
                <button
                    onClick={onCleanup}
                    disabled={actionLoading === "cleanup"}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4" /> {actionLoading === "cleanup" ? "Cleaning..." : "Cleanup & Auto-complete"}
                </button>
                <button
                    onClick={onExportBookings}
                    className="px-4 py-2 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-all flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Bookings
                </button>
                <button
                    onClick={onExportClients}
                    className="px-4 py-2 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-all flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Clients
                </button>
                <button
                    onClick={onOpenAnnouncement}
                    className="px-4 py-2 rounded-xl bg-gold-600 text-white text-sm font-medium hover:bg-gold-500 shadow-sm flex items-center gap-2 transition-all"
                >
                    <Megaphone className="w-4 h-4" /> Bulk Announcement
                </button>
            </div>
            {/* Mobile: show first action when collapsed */}
            {!expanded && (
                <div className="flex sm:hidden gap-2 mt-0">
                    {googleConnected === true && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium flex items-center gap-1.5">
                            <Wifi className="w-3 h-3" /> Google Connected
                        </div>
                    )}
                    {googleConnected === false && (
                        <button
                            onClick={onConnectGoogle}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5"
                        >
                            <Video className="w-3 h-3" /> Connect Google
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
