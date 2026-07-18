import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useMemo } from 'react';
import Layout from '@/Layouts/AdminLayout';

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
        // Audio unavailable (e.g. no user interaction yet)
    }
}

const STATUS_THEMES = {
    pending: 'bg-orange-50 border-orange-200 text-orange-700',
    confirmed: 'bg-blue-50 border-blue-200 text-blue-700',
    assigned: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    picked_up: 'bg-sky-50 border-sky-200 text-sky-700',
    processing: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    on_hold: 'bg-rose-50 border-rose-200 text-rose-700',
    ready: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    out_for_delivery: 'bg-purple-50 border-purple-200 text-purple-700',
    delivered: 'bg-slate-50 border-slate-200 text-slate-700',
    cancelled: 'bg-slate-100 border-slate-200 text-slate-400',
    rated: 'bg-slate-50 border-slate-200 text-slate-700',
};

const STATUS_LABELS = {
    pending: 'Awaiting Pickup',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    picked_up: 'Picked up',
    processing: 'Processing',
    on_hold: 'Issue Flag',
    ready: 'Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    rated: 'Rated',
};

const STAGE_THEMES = {
    received: 'bg-slate-100 text-slate-700',
    washing: 'bg-blue-100 text-blue-700',
    drying: 'bg-amber-100 text-amber-700',
    ironing: 'bg-emerald-100 text-emerald-700',
    quality_check: 'bg-indigo-100 text-indigo-700',
    ready: 'bg-teal-100 text-teal-700',
};

export default function Board({ orders, filters, pendingCount, readyCount, flaggedCount, driversList, recentTags, serviceAreas, statuses }) {
    const { props: pageProps } = usePage();
    const [localFilters, setLocalFilters] = useState(filters || {});
    const previousPending = useRef(pendingCount);

    const userName = pageProps.auth?.user?.name || 'Staff';

    const orderList = useMemo(() => {
        return Array.isArray(orders) ? orders : (orders.data || []);
    }, [orders]);

    useEffect(() => {
        if (pendingCount > previousPending.current) {
            beep();
        }
        previousPending.current = pendingCount;
    }, [pendingCount]);

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['orders', 'pendingCount', 'readyCount', 'flaggedCount', 'driversList', 'recentTags'], preserveScroll: true, preserveState: true });
        }, POLL_MS);
        return () => clearInterval(timer);
    }, []);

    function applyFilters(next) {
        const merged = { ...localFilters, ...next };
        setLocalFilters(merged);
        router.get('/admin/orders', merged, { preserveState: true, replace: true });
    }

    // Initials helper
    function getInitials(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    return (
        <div className="grid gap-6 lg:grid-cols-4 items-start">
            {/* Left + Center Area (3 columns) */}
            <div className="lg:col-span-3 space-y-6">
                
                {/* Good morning banner */}
                <div className="rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50/50 via-orange-50/20 to-white p-6 sm:p-8">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Good morning, {userName}</h1>
                    <p className="mt-2 text-slate-500 text-sm font-semibold">
                        Today's load is <span className="text-emerald-600 font-extrabold">Optimized</span>. {orderList.length} orders match current filters and {pendingCount} are awaiting pickup.
                    </p>
                </div>

                {/* Counter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-3xl border border-sky-100 bg-sky-50/40 p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">Pending Pickup</span>
                        <span className="text-4xl font-extrabold text-sky-950 mt-2 relative z-10">{pendingCount}</span>
                        <div className="absolute right-3 bottom-1 text-sky-100 text-7xl font-bold select-none opacity-40">↓</div>
                    </div>

                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Ready for Delivery</span>
                        <span className="text-4xl font-extrabold text-emerald-950 mt-2 relative z-10">{readyCount}</span>
                        <div className="absolute right-3 bottom-1 text-emerald-100 text-7xl font-bold select-none opacity-40">✓</div>
                    </div>

                    <div className="rounded-3xl border border-rose-100 bg-rose-50/40 p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">Issues Flagged</span>
                        <span className="text-4xl font-extrabold text-rose-950 mt-2 relative z-10">{flaggedCount}</span>
                        <div className="absolute right-3 bottom-1 text-rose-100 text-7xl font-bold select-none opacity-40">!</div>
                    </div>
                </div>

                {/* Order Tracking Table card */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Order Tracking</h2>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Live view of current processing queue</p>
                        </div>

                        {/* Filter inputs styled elegantly */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={localFilters.status || ''}
                                onChange={(e) => applyFilters({ status: e.target.value || undefined })}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">All areas</option>
                                {serviceAreas.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} {!a.active && '(inactive)'}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2">
                                <span className="text-xs font-extrabold text-slate-700">📅</span>
                                <input
                                    type="date"
                                    value={localFilters.date || ''}
                                    onChange={(e) => applyFilters({ date: e.target.value || undefined })}
                                    className="bg-transparent border-0 p-0 text-xs font-extrabold text-slate-800 focus:ring-0 focus:outline-none"
                                />
                            </div>

                            {(localFilters.status || localFilters.service_area_id || localFilters.date) && (
                                <button
                                    onClick={() => applyFilters({ status: undefined, service_area_id: undefined, date: undefined })}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                    <th className="pb-3 pr-4">Order ID</th>
                                    <th className="pb-3 px-4">Customer</th>
                                    <th className="pb-3 px-4">Service</th>
                                    <th className="pb-3 px-4">Status</th>
                                    <th className="pb-3 pl-4">Driver</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                                {orderList.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 pr-4">
                                            <Link href={`/admin/orders/${order.id}`} className="font-bold text-slate-900 hover:text-orange-600 underline">
                                                #CL-{order.id}
                                            </Link>
                                            <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                Scheduled: {order.time_slot ? order.time_slot.window : '—'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                                                    {getInitials(order.user?.name)}
                                                </span>
                                                <div>
                                                    <div className="text-slate-900 text-sm font-bold leading-tight">{order.user?.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5">{order.user?.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-medium text-slate-600">
                                            <div className="max-w-[160px] truncate">
                                                {order.items?.map((item, index) => (
                                                    <span key={item.id}>
                                                        {item.service?.name} (x{item.qty})
                                                        {index < order.items.length - 1 ? ', ' : ''}
                                                    </span>
                                                )) || '—'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_THEMES[order.status] || 'bg-slate-100'}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 pl-4 text-sm text-slate-900 font-bold">
                                            {order.driver_tasks && order.driver_tasks.length > 0
                                                ? order.driver_tasks[order.driver_tasks.length - 1]?.driver?.user?.name
                                                : 'Unassigned'}
                                        </td>
                                    </tr>
                                ))}
                                {orderList.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            No orders match these filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {(() => {
                        const links = orders.meta?.links || orders.links;
                        if (!links || !Array.isArray(links)) return null;
                        return (
                            <div className="mt-4 flex flex-wrap gap-1">
                                {links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                                            link.active ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        } disabled:opacity-40`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Bottom Row Grid */}
                <div className="grid gap-6 sm:grid-cols-2">
                    
                    {/* Garment Tags Box */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold text-slate-900">Garment Tags</h3>
                            <span className="text-slate-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </span>
                        </div>

                        {recentTags.length === 0 ? (
                            <p className="text-xs text-slate-400 font-semibold py-8 text-center">No active scanned tags logged.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentTags.map((tag) => (
                                    <div key={tag.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider bg-slate-200/50 px-1.5 py-0.5 rounded">
                                                {tag.qr_code}
                                            </span>
                                            <p className="text-xs font-bold text-slate-700 mt-1">
                                                Order #{tag.order_item?.order_id || 'N/A'} ({tag.order_item?.order?.user?.name || 'Customer'})
                                            </p>
                                        </div>
                                        <span className={`rounded-xl px-2.5 py-1 text-xs font-bold capitalize ${STAGE_THEMES[tag.stage] || 'bg-slate-100 text-slate-600'}`}>
                                            {tag.stage}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href="/admin/orders" className="block text-center text-xs font-bold text-orange-600 hover:text-orange-700 pt-2">
                            Generate Bulk Tags
                        </Link>
                    </div>

                    {/* Operational Timeline Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold text-slate-900">Operational Timeline</h3>
                            <div className="flex gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                            </div>
                        </div>

                        {/* Horizontal Timeline */}
                        <div className="pt-4 pb-2 relative flex items-center justify-between">
                            {/* Horizontal connect line */}
                            <div className="absolute left-6 right-6 top-7 h-0.5 bg-slate-200 z-0"></div>
                            
                            {[
                                { label: 'Address Pickup', active: true },
                                { label: 'Tagging', active: true },
                                { label: 'Cleaning', active: true },
                                { label: 'Ready', active: false },
                                { label: 'Invoice Issued', active: false }
                            ].map((step, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center gap-3">
                                    <span className={`h-8 w-8 rounded-full border-4 flex items-center justify-center text-xs font-bold ${
                                        step.active
                                            ? 'bg-orange-600 border-orange-100 text-white'
                                            : 'bg-white border-slate-200 text-slate-300'
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <span className="text-[10px] font-extrabold text-slate-400 text-center max-w-[70px]">
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel Sidebar (1 column) */}
            <div className="space-y-6">
                
                {/* Shift Capacity */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Shift Capacity</h3>
                        <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>Morning (8am-12pm)</span>
                                <span>92%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>Afternoon (12pm-4pm)</span>
                                <span>65%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>Evening (4pm-8pm)</span>
                                <span>40%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                    </div>

                    <Link href="/admin/time-slots" className="block text-xs font-extrabold text-orange-600 hover:text-orange-700 pt-2 border-t border-slate-100">
                        View All Time Slots →
                    </Link>
                </div>

                {/* Today's Drivers */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Today's Drivers</h3>
                        <p className="text-[10px] text-slate-400 font-extrabold mt-1">
                            {driversList.filter(d => d.active).length} Active • {driversList.filter(d => !d.active).length} On Break
                        </p>
                    </div>

                    <div className="space-y-4">
                        {driversList.map((driver) => (
                            <div key={driver.id} className="rounded-2xl border border-slate-100 p-4 space-y-3.5 bg-slate-50/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                                            {getInitials(driver.name)}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 leading-tight">{driver.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">{driver.vehicle_type} • {driver.vehicle_number}</p>
                                        </div>
                                    </div>
                                    <span className={`h-2.5 w-2.5 rounded-full ring-4 ring-white shrink-0 ${driver.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                </div>

                                <div className="text-[11px] font-semibold text-slate-500 space-y-1 bg-white rounded-xl p-2.5 border border-slate-100">
                                    <div className="flex justify-between">
                                        <span>Current Task:</span>
                                        <span className="text-slate-900 font-bold">{driver.tasks_count > 0 ? 'Delivery Run' : 'Awaiting Assignment'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>OTP Status:</span>
                                        <span className="text-emerald-600 font-bold">Verified</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span>GPS Position:</span>
                                        <span className="text-orange-600 font-bold">1.2 mi away 📍</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

Board.layout = (page) => <Layout children={page} />;
