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

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <header className="flex items-center justify-between bg-slate-900 px-6 py-3 text-white">
                <Link href="/shop/board" className="font-semibold">Clean Quick Laundry — Shop Floor</Link>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                    <span>{props.auth?.user?.name}</span>
                    <Link href="/admin/logout" method="post" as="button" className="text-slate-300 hover:text-white">
                        Log out
                    </Link>
                </div>
            </header>
            <main className="p-6">
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
    );
}
