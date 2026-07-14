import { Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const NAV = [
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/services', label: 'Services' },
    { href: '/admin/time-slots', label: 'Time Slots' },
    { href: '/admin/service-areas', label: 'Service Areas' },
    { href: '/admin/customers', label: 'Customers' },
    { href: '/admin/reports/daily', label: 'Daily Report' },
    { href: '/admin/settings', label: 'Settings' },
];

export default function Layout({ children }) {
    const { props, url } = usePage();
    const flash = props.flash || {};

    useEffect(() => {
        if (flash.success || flash.error) {
            const timer = setTimeout(() => router.reload({ only: [] }), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.error]);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex">
                <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 min-h-screen p-4">
                    <div className="text-lg font-semibold mb-6 px-2">Clean Quick Laundry</div>
                    <nav className="space-y-1">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block rounded px-3 py-2 text-sm ${
                                    url.startsWith(item.href) ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-8 border-t border-slate-700 pt-4 px-2 text-sm text-slate-400">
                        <div>{props.auth?.user?.name}</div>
                        <Link href="/admin/logout" method="post" as="button" className="mt-2 text-slate-300 hover:text-white">
                            Log out
                        </Link>
                    </div>
                </aside>
                <main className="flex-1 p-6">
                    {flash.success && (
                        <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
