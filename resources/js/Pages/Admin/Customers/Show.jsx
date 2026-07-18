import { Link, usePage } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';

export default function Show({ customer, addresses, orders, stats }) {
    const { props } = usePage();
    const addressList = Array.isArray(addresses) ? addresses : (addresses.data || []);
    const orderList = Array.isArray(orders) ? orders : (orders.data || []);

    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[props.settings?.currency || 'GBP'] || '£';

    // Helper for initials
    const initials = customer.name
        ? customer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'US';

    // Status pill theme helper
    const STATUS_PILLS = {
        pending: 'bg-orange-50 text-orange-700 border-orange-100',
        confirmed: 'bg-sky-50 text-sky-700 border-sky-100',
        picked_up: 'bg-violet-50 text-violet-700 border-violet-100',
        processing: 'bg-amber-50 text-amber-700 border-amber-100',
        ready: 'bg-teal-50 text-teal-700 border-teal-100',
        delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Link href="/admin/customers" className="hover:text-orange-600 transition-colors">Users</Link>
                        <span>/</span>
                        <span className="text-slate-600">Customer Profile</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Profile</h1>
                </div>

                <Link
                    href="/admin/customers"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-4 py-2.5 shadow-sm transition-all"
                >
                    ← Back to Users
                </Link>
            </div>

            {/* Main Dual-Column Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Profile Card & Summary stats */}
                <div className="space-y-6">
                    {/* User Meta Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <span className="h-20 w-20 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center font-extrabold text-2xl border-4 border-orange-500">
                                {initials}
                            </span>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-950">{customer.name}</h2>
                                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold border capitalize ${
                                    customer.role === 'business_client' 
                                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                    {customer.role === 'business_client' ? 'Business Client' : 'Customer'}
                                </span>
                            </div>
                        </div>

                        {/* Customer attributes list */}
                        <div className="border-t border-slate-100 pt-5 text-left text-xs font-semibold text-slate-500 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Phone</span>
                                <span className="text-slate-900 font-bold">{customer.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Email</span>
                                <span className="text-slate-900 font-bold">{customer.email || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Language</span>
                                <span className="text-slate-900 font-bold uppercase">{customer.language || 'en'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status</span>
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Joined</span>
                                <span className="text-slate-900 font-bold">{customer.created_at?.slice(0, 10)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                            <span className="text-2xl font-extrabold text-slate-950">{stats.orders_count}</span>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">LTV Spent</span>
                            <span className="text-2xl font-extrabold text-slate-950">{currencySymbol}{stats.total_spent.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Columns: Addresses & Order History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Saved Addresses Panel */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Saved Addresses</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {addressList.map((addr) => (
                                <div key={addr.id} className="rounded-2xl border border-slate-150 p-4 space-y-2 hover:border-blue-400 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-slate-900">{addr.label}</span>
                                        <span className="inline-flex rounded bg-orange-50 text-orange-700 px-1.5 py-0.5 text-[10px] font-bold">
                                            {addr.service_area?.name || 'Area'}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 leading-normal">
                                        {addr.address_line_1}
                                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Postcode: {addr.postcode}
                                    </p>
                                </div>
                            ))}
                            {addressList.length === 0 && (
                                <div className="sm:col-span-2 text-center py-6 text-slate-400 text-xs font-semibold">
                                    No saved addresses found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order History Table Panel */}
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Order History Log</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-semibold text-slate-500">
                                <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="py-4 px-6">Order ID</th>
                                        <th className="py-4 px-6">Date</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th className="py-4 px-6 text-right">Total</th>
                                        <th className="py-4 px-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {orderList.map((ord) => {
                                        const pillTheme = STATUS_PILLS[ord.status] || STATUS_PILLS.pending;
                                        return (
                                            <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6 font-extrabold text-slate-950">
                                                    #{ord.id}
                                                </td>
                                                <td className="py-4 px-6 text-slate-600">
                                                    {ord.created_at?.slice(0, 10)}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold border capitalize ${pillTheme}`}>
                                                        {ord.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right font-extrabold text-slate-950">
                                                    {currencySymbol}{parseFloat(ord.total).toFixed(2)}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Link
                                                        href={`/admin/orders/${ord.id}`}
                                                        className="text-orange-600 hover:text-orange-700 font-extrabold text-xs transition-colors"
                                                    >
                                                        Details →
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {orderList.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-slate-400 text-xs font-semibold">
                                                No bookings recorded.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page) => <Layout children={page} />;
