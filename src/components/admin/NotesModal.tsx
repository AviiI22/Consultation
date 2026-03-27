"use client";

interface NotesModalProps {
    open: boolean;
    bookingId: string;
    currentNote: string;
    onClose: () => void;
    onSave: (id: string, note: string) => void;
}

interface MeetLinkModalProps {
    open: boolean;
    bookingId: string;
    currentLink: string;
    onClose: () => void;
    onSave: (id: string, link: string) => void;
}

import { useState, useEffect } from "react";

export function NotesModal({ open, bookingId, currentNote, onClose, onSave }: NotesModalProps) {
    const [text, setText] = useState(currentNote);

    useEffect(() => {
        setText(currentNote);
    }, [currentNote, bookingId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-serif text-gray-800 mb-3">📝 Admin Notes</h3>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500 resize-none"
                    placeholder="Session notes, observations..."
                />
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => { onSave(bookingId, text); onClose(); }}
                        className="flex-1 py-2 rounded-xl bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export function MeetLinkModal({ open, bookingId, currentLink, onClose, onSave }: MeetLinkModalProps) {
    const [text, setText] = useState(currentLink);

    useEffect(() => {
        setText(currentLink);
    }, [currentLink, bookingId]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-serif text-gray-800 mb-3">🔗 Meeting Link</h3>
                <input
                    type="url"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-cream-50 border-2 border-cream-400/60 text-sm focus:outline-none focus:border-gold-500"
                    placeholder="https://meet.google.com/..."
                />
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => { onSave(bookingId, text); onClose(); }}
                        className="flex-1 py-2 rounded-xl bg-gold-500 text-white text-sm font-medium hover:bg-gold-400 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-cream-100 text-cream-700 text-sm font-medium hover:bg-cream-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
