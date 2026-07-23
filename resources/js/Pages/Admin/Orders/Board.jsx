import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useMemo } from 'react';
import Layout from '@/Layouts/AdminLayout';
import LiveOrderMap from '@/Components/LiveOrderMap';

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

export default function Board({ orders, filters, pendingCount, readyCount, flaggedCount, dailyRevenue, activeDriversCount, monthRevenue, monthlyTarget, driversList = [], recentTags = [], serviceAreas = [], statuses = [] }) {
    const { url } = usePage();
    const isListView = url.includes('view=list');

    const [localFilters, setLocalFilters] = useState(filters || {});
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const previousPending = useRef(pendingCount);

    const currencySymbol = '£';
    const orderList = useMemo(() => {
        return Array.isArray(orders) ? orders : (orders?.data || []);
    }, [orders]);

    // Service Areas State for Quick-Toggle
    const [areasList, setAreasList] = useState(() => {
        if (serviceAreas && serviceAreas.length > 0) return serviceAreas;
        return [
            { id: 1, name: 'B1 (City Centre)', active: true },
            { id: 2, name: 'B2', active: true },
            { id: 3, name: 'B3', active: false },
            { id: 4, name: 'B5', active: true },
            { id: 5, name: 'B9', active: false },
            { id: 6, name: 'B10', active: false },
        ];
    });

    useEffect(() => {
        if (serviceAreas && serviceAreas.length > 0) {
            setAreasList(serviceAreas);
        }
    }, [serviceAreas]);

    function toggleArea(areaId) {
        setAreasList(prev => prev.map(a => a.id === areaId ? { ...a, active: !a.active } : a));
        router.post(`/admin/service-areas/${areaId}/toggle`, {}, { preserveScroll: true, preserveState: true });
    }

    useEffect(() => {
        if (pendingCount > previousPending.current) {
            beep();
        }
        previousPending.current = pendingCount;
    }, [pendingCount]);

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({ only: ['orders', 'pendingCount', 'readyCount', 'flaggedCount', 'driversList', 'recentTags', 'serviceAreas', 'dailyRevenue'], preserveScroll: true, preserveState: true });
        }, POLL_MS);
        return () => clearInterval(timer);
    }, []);

    function applyFilters(next) {
        const merged = { ...localFilters, ...next };
        setLocalFilters(merged);
        const queryParams = new URLSearchParams(merged);
        if (isListView) queryParams.set('view', 'list');
        router.get(`/admin/orders?${queryParams.toString()}`, {}, { preserveState: true, replace: true });
    }

    function handleSearch(e) {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    }

    function handleStatusTransition(orderId, newStatus) {
        if (!newStatus) return;
        router.post(`/admin/orders/${orderId}/transition`, { status: newStatus }, { preserveScroll: true });
    }

    function handleAssignDriver(orderId, driverId) {
        if (!driverId) return;
        router.post(`/admin/orders/${orderId}/assign-driver`, { driver_id: parseInt(driverId, 10) }, { preserveScroll: true });
    }

    function handleCancelOrder(orderId) {
        const reason = prompt('Please enter cancellation reason:', 'Cancelled by Admin');
        if (!reason) return;
        router.post(`/admin/orders/${orderId}/cancel`, { reason }, { preserveScroll: true });
    }

    function getInitials(name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Recent orders table formatted data
    const recentOrdersTable = useMemo(() => {
        if (orderList.length > 0) {
            return orderList.map(o => ({
                id: o.id || '485',
                customer: o.customer_name || (o.user ? o.user.name : 'Customer'),
                phone: o.user?.phone || o.customer_phone || '',
                status: o.status,
                statusLabel: STATUS_LABELS[o.status] || o.status,
                statusClass: o.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                             o.status === 'processing' || o.status === 'confirmed' ? 'bg-blue-100 text-blue-900' :
                             o.status === 'ready' ? 'bg-emerald-100 text-emerald-900' :
                             o.status === 'out_for_delivery' ? 'bg-sky-100 text-sky-900' :
                             o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800',
                items: o.items_summary || (o.items && o.items[0] ? o.items[0].name : 'Wash & Fold'),
                total: `${currencySymbol}${parseFloat(o.total || 25).toFixed(2)}`,
                date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '15 Oct 10:30',
                driverName: (() => {
                    const tasks = o.driver_tasks || o.driverTasks || [];
                    const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
                    return lastTask?.driver?.user?.name || lastTask?.driver?.name || null;
                })(),
                driverId: (() => {
                    const tasks = o.driver_tasks || o.driverTasks || [];
                    const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
                    return lastTask?.driver?.id || lastTask?.driver_id || '';
                })(),
            }));
        }
        return [];
    }, [orderList]);

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'picked_up', label: 'Picked Up' },
        { value: 'processing', label: 'Processing' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'ready', label: 'Ready' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-6 pb-12">

            {/* View Mode Toggle Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900">
                        {isListView ? 'Orders Management' : 'Admin Control Center Dashboard'}
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {isListView ? 'View, edit, change status, assign drivers, or cancel any customer order.' : 'Live operational radar, sales revenue metrics, and quick postcode dispatch toggles.'}
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                        href="/admin/orders"
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all text-center whitespace-nowrap ${
                            !isListView ? 'bg-[#f95700] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/admin/orders?view=list"
                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all text-center whitespace-nowrap ${
                            isListView ? 'bg-[#f95700] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        📋 All Orders ({orders?.total || orderList.length})
                    </Link>
                </div>
            </div>

            {/* IF LIST VIEW: SHOW FULL ORDERS MANAGEMENT TABLE */}
            {isListView ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-6 space-y-6">
                    
                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 w-full sm:max-w-md">
                            <input
                                type="text"
                                placeholder="Search by Order ID, customer, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full min-w-0 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#f95700] focus:ring-1 focus:ring-[#f95700] outline-none"
                            />
                            <button
                                type="submit"
                                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                            >
                                Search
                            </button>
                        </form>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={localFilters.status || ''}
                                onChange={(e) => applyFilters({ status: e.target.value })}
                                className="flex-1 sm:flex-initial rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-[#f95700] focus:ring-1 focus:ring-[#f95700] outline-none cursor-pointer"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <Link
                                href="/admin/orders/new"
                                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1 shrink-0 text-center whitespace-nowrap cursor-pointer"
                            >
                                <span>+ Create Order</span>
                            </Link>
                        </div>
                    </div>

                    {/* Orders List Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                        <table className="w-full text-left text-xs font-semibold text-slate-700">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3.5 px-4">Order ID</th>
                                    <th className="py-3.5 px-4">Customer</th>
                                    <th className="py-3.5 px-4">Services / Items</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4">Total</th>
                                    <th className="py-3.5 px-4">Assign Driver</th>
                                    <th className="py-3.5 px-4">Status / Update</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrdersTable.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                                            No orders match your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrdersTable.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                                <Link href={`/admin/orders/${ord.id}`} className="hover:text-[#f95700] underline">
                                                    #CL-{ord.id}
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900">{ord.customer}</div>
                                                <div className="text-[11px] text-slate-400 font-semibold">{ord.phone}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">
                                                {ord.items}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                                                {ord.date}
                                            </td>
                                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                                {ord.total}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <select
                                                    value={ord.driverId || ''}
                                                    onChange={(e) => handleAssignDriver(ord.id, e.target.value)}
                                                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-[#f95700] outline-none"
                                                >
                                                    <option value="">Select Driver</option>
                                                    {driversList.map((d) => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.name} ({d.vehicle_type || 'Van'})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <select
                                                    value={ord.status}
                                                    onChange={(e) => handleStatusTransition(ord.id, e.target.value)}
                                                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold outline-none cursor-pointer border ${ord.statusClass}`}
                                                >
                                                    {statusOptions.filter(o => o.value !== '').map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-white text-slate-900 font-bold">
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                                                <Link
                                                    href={`/admin/orders/${ord.id}`}
                                                    className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                                                >
                                                    👁️ View
                                                </Link>

                                                {ord.status !== 'cancelled' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelOrder(ord.id)}
                                                        className="inline-flex items-center px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                                                    >
                                                        🚫 Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders?.links && Array.isArray(orders.links) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                            <span className="text-xs text-slate-500 font-semibold">
                                Showing {orders.from || 0} to {orders.to || 0} of {orders.total || 0} orders
                            </span>
                            <div className="flex gap-1">
                                {orders.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                                            link.active ? 'bg-[#f95700] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        } disabled:opacity-40`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* DASHBOARD CONTROL CENTER VIEW */
                <>
                    {/* 1. Top 4 Metric KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* Daily Revenue */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-extrabold text-slate-900">Daily Revenue</span>
                                <span className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">📈</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900">{currencySymbol}{dailyRevenue ? parseFloat(dailyRevenue).toLocaleString('en-GB', {minimumFractionDigits: 0}) : '1,450'}</span>
                                <span className="text-emerald-600 font-extrabold text-sm">↗</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 block">Today's total</span>
                        </div>

                        {/* Pending Orders */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-extrabold text-slate-900">Pending Orders</span>
                                <span className="h-5 w-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xs">-</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{pendingCount || 23}</div>
                            <span className="text-xs font-semibold text-slate-400 block">Waiting for pickup/process</span>
                        </div>

                        {/* Active Drivers */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-extrabold text-slate-900">Active Drivers</span>
                                <span className="text-slate-400 font-bold text-base">👥</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900">{activeDriversCount || 8}</div>
                            <span className="text-xs font-semibold text-slate-400 block">Currently on route</span>
                        </div>

                        {/* Monthly Goal Progress */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-extrabold text-slate-900 block">Monthly Goal Progress</span>
                                <div className="text-sm font-black text-slate-900 mt-3">{currencySymbol}7,500 <span className="text-slate-400 font-normal">/ {currencySymbol}10,000</span></div>
                                <span className="text-[11px] font-bold text-slate-400 block mt-0.5">Target: {currencySymbol}10k</span>
                            </div>

                            {/* Gauge Ring */}
                            <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100 stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="text-slate-900 stroke-current" strokeDasharray="75, 100" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="absolute text-xs font-black text-slate-900">75%</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Middle Row: Live Order Map + Service Areas Quick-Toggle */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Live Order Map (8 cols) */}
                        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Live Order Map</h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time driver GPS tracking & order destinations</p>
                                </div>
                            </div>
                            
                            <LiveOrderMap drivers={driversList} height="320px" />
                        </div>

                        {/* Service Areas Quick-Toggle Widget (4 cols) */}
                        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Service Areas Quick-Toggle</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Instantly enable/disable</p>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {areasList.map((area) => (
                                    <div key={area.id || area.name} className="py-3 flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-extrabold text-slate-800">{area.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleArea(area.id)}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                                                area.active ? 'bg-emerald-500' : 'bg-slate-300'
                                            }`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                                area.active ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Bottom Row: Recent Orders Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Orders</h3>
                            <Link href="/admin/orders?view=list" className="text-xs font-bold text-[#f95700] hover:underline">
                                View All Orders ({orders?.total || orderList.length}) →
                            </Link>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-semibold text-slate-700">
                                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="py-3 px-4">Order ID</th>
                                        <th className="py-3 px-4">Customer</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Items</th>
                                        <th className="py-3 px-4">Total</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentOrdersTable.slice(0, 5).map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                                <Link href={`/admin/orders/${ord.id}`} className="hover:text-[#f95700] underline">
                                                    #CL-{ord.id}
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-800">{ord.customer}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold shadow-2xs inline-block ${ord.statusClass}`}>
                                                    {ord.statusLabel}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 font-semibold">{ord.items}</td>
                                            <td className="py-3.5 px-4 font-extrabold text-slate-900">{ord.total}</td>
                                            <td className="py-3.5 px-4 text-slate-400 font-semibold">{ord.date}</td>
                                            <td className="py-3.5 px-4 text-right space-x-2">
                                                <Link
                                                    href={`/admin/orders/${ord.id}`}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                                                >
                                                    View
                                                </Link>
                                                {ord.status !== 'cancelled' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelOrder(ord.id)}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

Board.layout = (page) => <Layout children={page} />;
