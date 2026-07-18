import { useEffect, useRef, useState } from 'react';

let nextId = 0;

const ICONS = {
    success: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
    ),
};

const THEME = {
    success: {
        wrap: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        badge: 'bg-emerald-500 text-white',
        close: 'text-emerald-500 hover:text-emerald-700',
    },
    error: {
        wrap: 'bg-rose-50 border-rose-200 text-rose-800',
        badge: 'bg-rose-500 text-white',
        close: 'text-rose-500 hover:text-rose-700',
    },
};

/** Watches Inertia's flash.success / flash.error and renders them as auto-dismissing toasts. */
export default function Toaster({ flash, duration = 4500 }) {
    const [toasts, setToasts] = useState([]);
    const lastSuccess = useRef(null);
    const lastError = useRef(null);

    function push(type, message) {
        const id = ++nextId;
        setToasts(list => [...list, { id, type, message }]);
        setTimeout(() => dismiss(id), duration);
    }

    function dismiss(id) {
        setToasts(list => list.filter(t => t.id !== id));
    }

    useEffect(() => {
        if (flash?.success && flash.success !== lastSuccess.current) {
            lastSuccess.current = flash.success;
            push('success', flash.success);
        }
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error && flash.error !== lastError.current) {
            lastError.current = flash.error;
            push('error', flash.error);
        }
    }, [flash?.error]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
            {toasts.map(t => {
                const theme = THEME[t.type];
                return (
                    <div
                        key={t.id}
                        className={`animate-toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-lg ${theme.wrap}`}
                    >
                        <span className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${theme.badge}`}>
                            {ICONS[t.type]}
                        </span>
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} className={`shrink-0 ${theme.close}`} aria-label="Dismiss">
                            ✕
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
