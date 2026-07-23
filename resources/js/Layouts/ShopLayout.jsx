import { Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ShopLayout({ children }) {
    const { props } = usePage();
    const flash = props.flash || {};

    useEffect(() => {
        if (flash.success || flash.error) {
            const timer = setTimeout(() => router.reload({ only: [] }), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.error]);

    const businessName = props.settings?.business_name || 'Clean Quick Laundry';
    const businessLogo = props.settings?.business_logo;
    const businessInitials = businessName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CQ';

    const userName = props.auth?.user?.name || 'Shop Manager';
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SM';

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
            {/* Top Navbar Header matching body container size */}
            <header className="h-16 bg-white border-b border-orange-200/60 sticky top-0 z-50 shadow-2xs text-slate-900">
                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                    {/* Left Brand & Portal Label */}
                    <div className="flex items-center gap-5">
                        <Link href="/shop/board" className="flex items-center gap-3 group">
                            {businessLogo ? (
                                <img src={businessLogo} alt={businessName} className="h-9 w-auto max-w-[170px] object-contain group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="h-9 w-9 rounded-xl bg-[#f95700] flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20">
                                        {businessInitials}
                                    </span>
                                    <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-[#f95700] transition-colors">
                                        {businessName}
                                    </span>
                                </div>
                            )}
                        </Link>

                        <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest font-mono">
                                SHOP OPERATIONS
                            </span>
                        </div>
                    </div>

                    {/* Right Profile & Actions */}
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-black text-slate-900 leading-tight">{userName}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">SHOP STAFF</div>
                            </div>
                            <span className="h-9 w-9 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs uppercase border border-slate-250 shadow-2xs">
                                {userInitials}
                            </span>
                        </div>

                        <span className="h-6 w-px bg-slate-200"></span>

                        <Link
                            href="/admin/logout"
                            method="post"
                            as="button"
                            className="rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-4 py-1.5 text-xs font-extrabold text-slate-800 shadow-2xs transition-all cursor-pointer"
                        >
                            Sign out
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                {flash.success && (
                    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-extrabold text-emerald-800 shadow-2xs">
                        ✓ {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-extrabold text-rose-800 shadow-2xs">
                        ⚠️ {flash.error}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
