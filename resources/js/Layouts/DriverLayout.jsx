import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Toaster from '@/Components/Toaster';

export default function DriverLayout({ children }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const driver = props.driver;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const [sidebarOpen, setSidebarOpen] = useState(false);

    function logout() {
        router.post('/driver/logout');
    }

    function toggleStatus() {
        router.post('/driver/toggle-status', {}, { preserveScroll: true });
    }

    const isOnline = driver?.active !== false;

    const initials = (driver?.user?.name || 'D')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const navItems = [
        {
            href: '/driver/dashboard',
            label: "Today's Runs",
            active: currentPath === '/driver/dashboard',
            icon: (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a1 1 0 00-1-1h-9l-2-2H4a1 1 0 00-1 1v13a1 1 0 001 1h9m5-5v5m0 0h-5m5 0l-6-6" />
                </svg>
            ),
        },
        {
            href: '/driver/live-queue',
            label: 'Live Task Queue',
            active: currentPath === '/driver/live-queue',
            icon: (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            ),
        },
        {
            href: '/driver/otp-handover',
            label: 'OTP Handover',
            active: currentPath === '/driver/otp-handover',
            icon: (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 11-12 0 6 6 0 0112 0zM3 21l6.5-6.5" />
                </svg>
            ),
        },
        {
            href: '/driver/history',
            label: 'Task History',
            active: currentPath === '/driver/history' || currentPath.startsWith('/driver/tasks'),
            icon: (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="driver-portal h-screen overflow-hidden bg-slate-50 font-sans flex flex-col">
            <Toaster flash={flash} />

            {/* Top header */}
            <header className="bg-white border-b border-slate-200 shrink-0 z-40">
                <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
                    {/* Brand */}
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden -ml-1 p-2 text-slate-500 hover:text-slate-800 shrink-0"
                            aria-label="Open menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center shrink-0">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="leading-tight min-w-0">
                            <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">Clean Quick Laundry</p>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Driver App</p>
                        </div>
                    </div>

                    {/* Status + profile + logout */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isOnline ? 'text-orange-600' : 'text-slate-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l border-slate-200">
                            <div className="text-right leading-tight hidden md:block">
                                <p className="text-sm font-extrabold text-slate-800">{driver?.user?.name}</p>
                                <p className="text-[11px] text-slate-400 font-bold font-mono">{driver?.vehicle_number}</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-black text-xs shrink-0">
                                {initials}
                            </div>
                            <button className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 transition-colors" aria-label="Notifications">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <button
                                onClick={logout}
                                className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative overflow-hidden min-h-0">
                {/* Mobile backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`w-64 md:w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto fixed md:relative inset-y-0 left-0 top-16 md:top-0 md:h-full z-50 transition-transform duration-200 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
                >
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-black text-sm shrink-0">
                            {initials}
                        </div>
                        <div className="leading-tight min-w-0 flex-1">
                            <p className="text-sm font-extrabold text-slate-800 truncate">{driver?.user?.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold font-mono">{driver?.vehicle_number}</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden p-1 text-slate-400 hover:text-slate-600 shrink-0"
                            aria-label="Close menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 py-3 px-2.5 space-y-1">
                        {navItems.map(item => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                                    item.active
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-2.5 border-t border-slate-100 space-y-1">
                        <Link
                            href="/driver/support"
                            onClick={() => setSidebarOpen(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                                currentPath === '/driver/support'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Support
                        </Link>
                        <Link
                            href="/driver/settings"
                            onClick={() => setSidebarOpen(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                                currentPath === '/driver/settings'
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Link>
                        <button
                            onClick={toggleStatus}
                            className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                                isOnline
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
