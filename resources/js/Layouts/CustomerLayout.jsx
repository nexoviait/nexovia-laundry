import { Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const NAV = [
    { href: '/dashboard', label: 'My Orders' },
    { href: '/book', label: 'Book Laundry' },
    { href: '/addresses', label: 'My Addresses' },
];

export default function CustomerLayout({ children }) {
    const { props, url } = usePage();
    const flash = props.flash || {};

    useEffect(() => {
        if (flash.success || flash.error) {
            const timer = setTimeout(() => {
                router.reload({ only: [] });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.error]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm/50 backdrop-blur-md bg-white/95">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                            CQ
                        </span>
                        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                            Clean Quick
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-semibold transition-all duration-200 hover:text-indigo-600 ${
                                    url.startsWith(item.href) ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-600'
                                }`}
                                id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Customer Account / Sign Out */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-900">{props.auth?.user?.name || 'Customer'}</div>
                            <div className="text-xs text-slate-500 font-medium">{props.auth?.user?.phone}</div>
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-xl border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/50 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-700 shadow-sm transition-all duration-200"
                            id="btn-logout"
                        >
                            Sign out
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden sticky top-16 z-40 bg-white border-b border-slate-200/80 px-4 py-2 flex items-center justify-around">
                {NAV.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                            url.startsWith(item.href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Main Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alert Notifications */}
                {flash.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 backdrop-blur-sm px-5 py-3 text-sm text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
                        <span className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/60 backdrop-blur-sm px-5 py-3 text-sm text-rose-800 flex items-center gap-3 animate-fade-in shadow-sm">
                        <span className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">!</span>
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
