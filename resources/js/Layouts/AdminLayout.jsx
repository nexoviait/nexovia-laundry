import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Toaster from '@/Components/Toaster';

const NAV = [
    { 
        href: '/admin/orders', 
        label: 'Dashboard', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
        )
    },
    { 
        href: '/admin/orders?view=list', 
        label: 'Orders', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        )
    },
    { 
        href: '/admin/customers?role=customer', 
        label: 'Customers', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    { 
        href: '/admin/customers?role=driver', 
        label: 'Drivers', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
            </svg>
        )
    },
    { 
        href: '/admin/reports', 
        label: 'Reports & Analytics', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        subItems: [
            { href: '/admin/reports?filter=day', label: 'Daily Sales & Runs' },
            { href: '/admin/reports?filter=weekly', label: 'Weekly Summary' },
            { href: '/admin/reports?filter=monthly', label: 'Monthly Revenue' },
            { href: '/admin/reports?tab=undelivered', label: 'Undelivered Items Audit' },
        ]
    },
    { 
        href: '/admin/service-areas', 
        label: 'Service Areas', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    { 
        href: '/admin/time-slots', 
        label: 'Time Slots', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    { 
        href: '/admin/services', 
        label: 'Pricing Settings', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    { 
        href: '/admin/settings', 
        label: 'Site Settings', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        subItems: [
            { href: '/admin/settings?tab=payment', label: 'Payment Settings', tabKey: 'payment' },
            { href: '/admin/settings?tab=business', label: 'Business Profile', tabKey: 'business' },
            { href: '/admin/settings?tab=general', label: 'General & Fees', tabKey: 'general' },
            { href: '/admin/settings?tab=map', label: 'Map Settings', tabKey: 'map' },
            { href: '/admin/complaints', label: 'Complaints Desk' },
        ]
    },
];

export default function AdminLayout({ children }) {
    const { props, url } = usePage();
    const flash = props.flash || {};

    const [pendingHref, setPendingHref] = useState(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        setPendingHref(null);
        setMobileNavOpen(false);
    }, [url]);

    const userName = props.auth?.user?.name || 'Staff';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const businessName = props.settings?.business_name || 'Clean Quick Laundry';
    const businessLogo = props.settings?.business_logo || '';
    const businessInitials = businessName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CQ';

    const activeUrl = pendingHref || url;
    const currentPath = activeUrl.split('?')[0];
    const currentSearch = activeUrl.includes('?') ? activeUrl.split('?')[1] : '';

    return (
        <div className="min-h-screen bg-[#fafaf9] text-slate-800 flex flex-col font-sans">
            <Toaster flash={flash} />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                        className="lg:hidden p-2 rounded-xl border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold focus:outline-none"
                        aria-label="Toggle Navigation"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            {mobileNavOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    <Link href="/admin/orders" className="flex items-center gap-2 sm:gap-3.5 hover:opacity-95 transition-opacity group min-w-0">
                        <div className="flex items-center justify-center shrink-0">
                            {businessLogo ? (
                                <img
                                    src={businessLogo}
                                    alt={businessName}
                                    className="h-8 sm:h-11 w-auto max-h-11 max-w-[110px] sm:max-w-[180px] object-contain drop-shadow-xs transition-transform group-hover:scale-[1.02]"
                                />
                            ) : (
                                <span className="h-8 w-8 sm:h-10 sm:w-10 rounded-2xl bg-[#f95700] flex items-center justify-center text-white font-black text-xs sm:text-lg shadow-md shadow-orange-500/20 shrink-0">
                                    {businessInitials}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col justify-center leading-tight hidden md:flex">
                            <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 group-hover:text-[#f95700] transition-colors truncate">
                                {businessName}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#f95700] mt-0.5">
                                Laundry Management
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Right Profile & Logout */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#fed7aa] text-amber-900 flex items-center justify-center font-bold text-xs uppercase border border-amber-300/40 shrink-0">
                            {userInitials}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 hidden sm:inline">
                            {userName}
                        </span>
                    </div>

                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-extrabold text-slate-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                        Sign out
                    </Link>
                </div>
            </header>

            {/* Layout Wrapper */}
            <div className="flex flex-1 min-h-[calc(100vh-4rem)] relative bg-slate-50">
                {/* Mobile Backdrop */}
                {mobileNavOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-fade-in"
                        onClick={() => setMobileNavOpen(false)}
                    />
                )}

                {/* Desktop & Mobile Sidebar */}
                <aside className={`
                    fixed lg:sticky top-16 left-0 z-40 w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between h-[calc(100vh-4rem)] overflow-y-auto shrink-0 transition-transform duration-200 ease-in-out
                    ${mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="space-y-6 pb-6">
                        <nav className="space-y-1.5">
                            {NAV.map((item) => {
                                let active = false;
                                if (item.label === 'Dashboard') {
                                    active = currentPath === '/admin/orders' && !currentSearch.includes('view=list');
                                } else if (item.label === 'Orders') {
                                    active = currentPath === '/admin/orders' && currentSearch.includes('view=list');
                                } else if (item.label === 'Customers') {
                                    active = currentPath === '/admin/customers' && !currentSearch.includes('role=driver');
                                } else if (item.label === 'Drivers') {
                                    active = currentPath === '/admin/customers' && currentSearch.includes('role=driver');
                                } else if (item.label === 'Reports & Analytics') {
                                    active = currentPath.startsWith('/admin/reports');
                                } else if (item.label === 'Service Areas') {
                                    active = currentPath.startsWith('/admin/service-areas');
                                } else if (item.label === 'Time Slots') {
                                    active = currentPath.startsWith('/admin/time-slots');
                                } else if (item.label === 'Pricing Settings') {
                                    active = currentPath.startsWith('/admin/services');
                                } else if (item.label === 'Site Settings') {
                                    active = currentPath.startsWith('/admin/settings');
                                }

                                return (
                                    <div key={item.label} className="space-y-1">
                                        <Link
                                            href={item.href}
                                            onClick={() => setPendingHref(item.href)}
                                            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors duration-75 ${
                                                active
                                                    ? 'bg-orange-50 text-[#f95700]'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </div>
                                            {item.subItems && (
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    {active ? '▼' : '▶'}
                                                </span>
                                            )}
                                        </Link>

                                        {/* Render Submenu Items */}
                                        {item.subItems && active && (
                                            <div className="pl-6 space-y-1 animate-slide-down">
                                                {item.subItems.map((sub) => {
                                                    let isSubActive = false;
                                                    if (currentSearch.includes(`tab=${sub.tabKey}`)) {
                                                        isSubActive = true;
                                                     } else if (sub.tabKey === 'payment' && !currentSearch.includes('tab=')) {
                                                        isSubActive = true;
                                                    }

                                                    return (
                                                        <Link
                                                            key={sub.label}
                                                            href={sub.href}
                                                            onClick={() => setPendingHref(sub.href)}
                                                            className={`flex items-center gap-2 rounded-xl py-2 px-3.5 text-xs font-extrabold transition-colors ${
                                                                isSubActive
                                                                    ? 'bg-[#f95700] text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            <span>{sub.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Actions */}
                    <div className="space-y-6 pt-6 border-t border-slate-100 shrink-0">
                        {/* Prominent orange + Create Order button */}
                        <Link
                            href="/admin/orders/new"
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold py-3.5 px-4 w-full shadow-md shadow-orange-500/20 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] text-sm"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Order</span>
                        </Link>

                        <div className="space-y-1">
                            <Link
                                href="/admin/logout"
                                method="post"
                                as="button"
                                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 w-full text-left"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 p-4 sm:p-8 bg-slate-50 flex flex-col justify-between">
                    <div>
                        {children}
                    </div>

                    <footer className="mt-12 pt-6 border-t border-slate-200/80 text-center text-xs font-semibold text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span>© {new Date().getFullYear()} {businessName}. All rights reserved.</span>
                        <span>Developed by <a href="https://nexoviait.com/" target="_blank" rel="noopener noreferrer" className="font-extrabold text-[#f95700] hover:underline">Nexovia IT Limited</a></span>
                    </footer>
                </main>
            </div>
        </div>
    );
}
