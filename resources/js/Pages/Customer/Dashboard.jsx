import CustomerLayout from '@/Layouts/CustomerLayout';
import { Link, usePage } from '@inertiajs/react';

const STATUS_THEME = {
    pending: 'bg-amber-50 border-amber-200 text-amber-800',
    confirmed: 'bg-blue-50 border-blue-200 text-blue-800',
    assigned: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    picked_up: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    processing: 'bg-sky-50 border-sky-200 text-sky-800',
    on_hold: 'bg-rose-50 border-rose-200 text-rose-800',
    ready: 'bg-teal-50 border-teal-200 text-teal-800',
    out_for_delivery: 'bg-violet-50 border-violet-200 text-violet-800',
    delivered: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    rated: 'bg-slate-50 border-slate-200 text-slate-800',
    cancelled: 'bg-slate-50 border-slate-200 text-slate-500',
};

const STATUS_LABELS = {
    pending: 'Awaiting Confirmation',
    confirmed: 'Confirmed',
    assigned: 'Driver Assigned',
    picked_up: 'Items Collected',
    processing: 'Washing/Drying',
    on_hold: 'On Hold (Issue Flagged)',
    ready: 'Ready for Delivery',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    rated: 'Completed & Rated',
    cancelled: 'Cancelled',
};

export default function Dashboard({ orders }) {
    const { props } = usePage();
    const currency = props.settings?.currency || 'GBP';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

    const activeOrders = orders.data.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rated');
    const pastOrders = orders.data.filter((o) => o.status === 'delivered' || o.status === 'cancelled' || o.status === 'rated');

    return (
        <CustomerLayout>
            <div className="space-y-8">
                {/* Hero Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Laundry Dashboard</h1>
                        <p className="mt-2 text-slate-300 text-sm sm:text-base font-medium">Track your active orders or schedule a new home collection.</p>
                    </div>
                    <Link
                        href="/book"
                        id="btn-book-order"
                        className="rounded-2xl bg-white hover:bg-slate-50 text-indigo-950 hover:text-indigo-900 px-6 py-3.5 text-sm font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
                    >
                        + Book New Collection
                    </Link>
                </div>

                {/* Active Orders Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Active Collections
                        <span className="text-xs font-extrabold bg-indigo-100 text-indigo-700 h-5 px-2 rounded-full flex items-center justify-center">
                            {activeOrders.length}
                        </span>
                    </h2>

                    {activeOrders.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                            <span className="inline-flex h-12 w-12 rounded-2xl bg-slate-50 items-center justify-center text-slate-400 font-bold text-lg mb-4">
                                ∅
                            </span>
                            <h3 className="text-sm font-bold text-slate-950">No active laundry runs</h3>
                            <p className="mt-1 text-slate-500 text-xs font-semibold">Ready to get things clean? Click the button above to book!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {activeOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 p-6 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">Order #{order.id}</span>
                                        <span className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-bold ${STATUS_THEME[order.status]}`}>
                                            {STATUS_LABELS[order.status]}
                                        </span>
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <p className="text-slate-500 text-xs font-semibold">Scheduled Date</p>
                                        <p className="text-slate-950 text-sm font-bold">{order.time_slot?.date} ({order.time_slot?.window})</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-500 text-xs font-semibold">Order Total</p>
                                            <p className="text-slate-950 text-base font-extrabold">{currencySymbol}{parseFloat(order.total).toFixed(2)}</p>
                                        </div>
                                        <span className="text-indigo-600 text-xs font-extrabold hover:text-indigo-700">Track Order →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Past Orders Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Order History
                        <span className="text-xs font-extrabold bg-slate-200 text-slate-700 h-5 px-2 rounded-full flex items-center justify-center">
                            {pastOrders.length}
                        </span>
                    </h2>

                    {pastOrders.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm font-medium">
                            No past order history available.
                        </div>
                    ) : (
                        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Date Completed</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Items Count</th>
                                            <th className="px-6 py-4">Total Price</th>
                                            <th className="px-6 py-4">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                        {pastOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-slate-900 font-extrabold">#{order.id}</td>
                                                <td className="px-6 py-4 text-slate-500">{order.time_slot?.date || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-xl border px-2 py-0.5 text-xs font-bold ${STATUS_THEME[order.status]}`}>
                                                        {STATUS_LABELS[order.status]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-950 font-bold">{order.items?.length || 0} services</td>
                                                <td className="px-6 py-4 text-slate-950 font-extrabold">{currencySymbol}{parseFloat(order.total).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-xs font-bold">
                                                    <div className="flex items-center gap-3">
                                                        <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-700">
                                                            View Details
                                                        </Link>
                                                        <Link href={`/book?reorder_id=${order.id}`} className="text-emerald-600 hover:text-emerald-700">
                                                            Reorder
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
