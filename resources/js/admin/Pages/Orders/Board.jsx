import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Layout from '../../Layout';

const POLL_MS = 5000;

function beep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    } catch {
        // Audio unavailable (e.g. no user interaction yet) — badge alone still shows.
    }
}

const STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    picked_up: 'Picked up',
    processing: 'Processing',
    ready: 'Ready',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    rated: 'Rated',
};

export default function Board({ orders, filters, pendingCount, serviceAreas, statuses }) {
    const [localFilters, setLocalFilters] = useState(filters || {});
    const previousPending = useRef(pendingCount);

    useEffect(() => {
        if (pendingCount > previousPending.current) {
            beep();
        }
        previousPending.current = pendingCount;
    }, [pendingCount]);

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['orders', 'pendingCount'], preserveScroll: true, preserveState: true });
        }, POLL_MS);
        return () => clearInterval(timer);
    }, []);

    function applyFilters(next) {
        const merged = { ...localFilters, ...next };
        setLocalFilters(merged);
        router.get('/admin/orders', merged, { preserveState: true, replace: true });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Order board</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">New orders</span>
                    <span
                        className={`inline-flex min-w-[1.75rem] items-center justify-center rounded-full px-2 py-1 text-sm font-semibold ${
                            pendingCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                        {pendingCount}
                    </span>
                    <Link href="/admin/orders/new" className="ml-4 rounded bg-slate-900 px-3 py-2 text-sm text-white">
                        + Manual order
                    </Link>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-3 rounded bg-white p-4 shadow-sm">
                <select
                    value={localFilters.status || ''}
                    onChange={(e) => applyFilters({ status: e.target.value || undefined })}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {STATUS_LABELS[s] || s}
                        </option>
                    ))}
                </select>

                <select
                    value={localFilters.service_area_id || ''}
                    onChange={(e) => applyFilters({ service_area_id: e.target.value || undefined })}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                    <option value="">All areas</option>
                    {serviceAreas.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name} {!a.active && '(inactive)'}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={localFilters.date || ''}
                    onChange={(e) => applyFilters({ date: e.target.value || undefined })}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                />

                {(localFilters.status || localFilters.service_area_id || localFilters.date) && (
                    <button
                        onClick={() => applyFilters({ status: undefined, service_area_id: undefined, date: undefined })}
                        className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-600"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Area</th>
                            <th className="px-4 py-3">Pickup slot</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.map((order) => (
                            <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-slate-900 underline">
                                        #{order.id}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    {order.user?.name}
                                    <div className="text-xs text-slate-400">{order.user?.phone}</div>
                                </td>
                                <td className="px-4 py-3">{order.address?.service_area?.name}</td>
                                <td className="px-4 py-3">
                                    {order.time_slot ? `${order.time_slot.date} ${order.time_slot.window}` : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">
                                        {STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">£{order.total}</td>
                            </tr>
                        ))}
                        {orders.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                    No orders match these filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {orders.links && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {orders.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded px-3 py-1 text-sm ${
                                link.active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                            } disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

Board.layout = (page) => <Layout children={page} />;
