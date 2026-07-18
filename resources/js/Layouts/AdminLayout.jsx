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
        href: '/admin/customers', 
        label: 'User Management', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    { 
        href: '/admin/reports/revenue', 
        label: 'Revenue Analytics', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    { 
        href: '/admin/services', 
        label: 'Service Configuration', 
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        href: '/admin/settings',
        label: 'System Settings',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        href: '/admin/banners',
        label: 'Banners & CMS',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 8a2 2 0 012-2h12a2 2 0 012 2M4 8v10a2 2 0 002 2h12a2 2 0 002-2V8" />
            </svg>
        )
    },
    {
        href: '/admin/leads',
        label: 'Leads',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
];

export default function AdminLayout({ children }) {
    const { props, url } = usePage();
    const flash = props.flash || {};

    const userName = props.auth?.user?.name || 'Staff';
    const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="driver-portal min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            <Toaster flash={flash} />

            {/* Top Header Bar */}
            <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-50">
                {/* Left Brand */}
                <div className="flex items-center gap-2.5">
                    {props.settings?.business_logo ? (
                        <img
                            src={props.settings.business_logo}
                            alt="Logo"
                            className="h-9 w-auto max-w-[120px] object-contain rounded-lg"
                        />
                    ) : (
                        <>
                            <span className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-orange-100">
                                CQ
                            </span>
                            <span className="font-extrabold text-xl tracking-tight text-slate-900">
                                {props.settings?.business_name || 'Clean Laundry'}
                            </span>
                        </>
                    )}
                </div>

                {/* Center Search Input */}
                <div className="flex-1 max-w-md mx-8 relative hidden sm:block">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search orders, tags, or drivers..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-full py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                </div>

                {/* Right Profile Actions */}
                <div className="flex items-center gap-4">
                    {/* Bell notification badge stub */}
                    <button className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors relative">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-orange-600 rounded-full ring-2 ring-white"></span>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-extrabold text-sm border border-orange-200">
                            {userInitials}
                        </span>
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-bold text-slate-900 leading-none">{userName}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Jordan Staff</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Sidebar */}
                <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between overflow-y-auto">
                    <div className="space-y-8">
                        {/* Nav Section header */}
                        <div>
                            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3.5 mb-4">
                                Operational Center
                            </div>
                            <nav className="space-y-1">
                                {NAV.filter(item => {
                                    const role = props.auth?.user?.role;
                                    if (item.label === 'System Settings') {
                                        return role === 'super_admin';
                                    }
                                    if (['User Management', 'Revenue Analytics', 'Service Configuration', 'Banners & CMS', 'Leads'].includes(item.label)) {
                                        return ['super_admin', 'admin'].includes(role);
                                    }
                                    return true;
                                }).map((item) => {
                                    const active = item.href === '/admin/orders'
                                        ? url === '/admin/orders'
                                        : url.startsWith(item.href) && item.href !== '#';
                                    const Tag = item.href === '#' ? 'span' : Link;
                                    return (
                                        <Tag
                                            key={item.label}
                                            href={item.href !== '#' ? item.href : undefined}
                                            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${
                                                active
                                                    ? 'bg-orange-50 text-orange-600'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Tag>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        {/* A prominent blue + Create Order button */}
                        <Link
                            href="/admin/orders/new"
                            className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 w-full shadow-lg shadow-orange-200 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] text-sm"
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
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
