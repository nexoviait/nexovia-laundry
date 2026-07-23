import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function TablePagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 font-display">
            <span className="text-xs font-semibold text-slate-500">
                Showing <span className="font-extrabold text-slate-900">{startItem}</span> to{' '}
                <span className="font-extrabold text-slate-900">{endItem}</span> of{' '}
                <span className="font-extrabold text-slate-900">{totalItems}</span> results
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                        <button
                            key={pageNum}
                            type="button"
                            onClick={() => onPageChange(pageNum)}
                            className={`h-8 w-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-mono ${
                                currentPage === pageNum
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function DatePickerPopover({ label, value, onChange, isOpen, onToggle, onClose }) {
    const dateObj = value ? new Date(value + 'T00:00:00') : new Date();
    const [viewYear, setViewYear] = useState(dateObj.getFullYear());
    const [viewMonth, setViewMonth] = useState(dateObj.getMonth());

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    }

    function nextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    }

    function selectDay(day) {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const formatted = `${viewYear}-${m}-${d}`;
        onChange(formatted);
        onClose();
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-orange-50/60 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs group"
            >
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-display">{label}:</span>
                <span className="font-extrabold text-orange-600 font-mono flex items-center gap-1.5">
                    <span>📅</span>
                    <span>{value ? value : 'Select Date'}</span>
                </span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close popover when clicking anywhere outside */}
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-72 space-y-3 animate-fade-in font-sans">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                                ◀
                            </button>
                            <span className="text-xs font-extrabold text-slate-900 font-display">
                                {monthNames[viewMonth]} {viewYear}
                            </span>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                                ▶
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-display">
                            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const m = String(viewMonth + 1).padStart(2, '0');
                                const d = String(day).padStart(2, '0');
                                const curFormatted = `${viewYear}-${m}-${d}`;
                                const isSelected = value === curFormatted;

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => selectDay(day)}
                                        className={`h-8 w-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center font-mono ${
                                            isSelected
                                                ? 'bg-orange-600 text-white shadow-md shadow-orange-300'
                                                : 'hover:bg-orange-50 text-slate-700 hover:text-orange-600'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    const todayStr = new Date().toISOString().slice(0, 10);
                                    onChange(todayStr);
                                    onClose();
                                }}
                                className="text-[11px] font-extrabold text-orange-600 hover:underline cursor-pointer"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ReportsIndex({
    filters,
    summary,
    category_stats = [],
    orders = [],
    undelivered = [],
    undelivered_summary = {},
}) {
    const { props } = usePage();
    const currency = props.settings?.currency || 'GBP';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

    const [activeTab, setActiveTab] = useState(filters.tab || 'sales');
    const [selectedFilter, setSelectedFilter] = useState(filters.filter || 'monthly');
    const [customFrom, setCustomFrom] = useState(filters.from_date || '');
    const [customTo, setCustomTo] = useState(filters.to_date || '');
    const [singleDate, setSingleDate] = useState(filters.date || '');
    const [activePicker, setActivePicker] = useState(null);

    const [salesPage, setSalesPage] = useState(1);
    const [undeliveredPage, setUndeliveredPage] = useState(1);
    const itemsPerPage = 8;

    const paginatedSalesOrders = orders.slice((salesPage - 1) * itemsPerPage, salesPage * itemsPerPage);
    const paginatedUndelivered = undelivered.slice((undeliveredPage - 1) * itemsPerPage, undeliveredPage * itemsPerPage);

    function handleFilterChange(newFilter) {
        setSelectedFilter(newFilter);
        setSalesPage(1);
        setUndeliveredPage(1);
        router.get('/admin/reports', {
            filter: newFilter,
            tab: activeTab,
            date: newFilter === 'day' ? singleDate : undefined,
            from_date: newFilter === 'custom' ? customFrom : undefined,
            to_date: newFilter === 'custom' ? customTo : undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    function applyCustomRange(e) {
        if (e) e.preventDefault();
        setActivePicker(null);
        setSalesPage(1);
        setUndeliveredPage(1);
        router.get('/admin/reports', {
            filter: 'custom',
            tab: activeTab,
            from_date: customFrom,
            to_date: customTo,
        }, { preserveState: true, preserveScroll: true });
    }

    function handleExportCsv() {
        const queryParams = new URLSearchParams({
            filter: selectedFilter,
            tab: activeTab,
            date: singleDate || '',
            from_date: customFrom || '',
            to_date: customTo || '',
        }).toString();

        window.location.href = `/admin/reports/daily/export?${queryParams}`;
    }

    return (
        <div className="space-y-6 pb-12 animate-fade-in print:p-0">
            {/* Header Desk & Time Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 print:hidden">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                        Smart Financial & Operational Reports
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                        Showing data for: <span className="text-orange-600 font-extrabold">{filters.label}</span>
                    </p>
                </div>

                {/* Right Actions: Export CSV & Print */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleExportCsv}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <span>📥 Export CSV</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <span>🖨️ Print Report</span>
                    </button>
                </div>
            </div>

            {/* Always-Visible Visual Date Range Picker Selector */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4 print:hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Visual Interactive Date Pickers */}
                    <form onSubmit={applyCustomRange} className="flex flex-wrap items-center gap-3">
                        <DatePickerPopover
                            label="From"
                            value={customFrom}
                            isOpen={activePicker === 'from'}
                            onToggle={() => setActivePicker(activePicker === 'from' ? null : 'from')}
                            onClose={() => setActivePicker(null)}
                            onChange={(val) => setCustomFrom(val)}
                        />

                        <DatePickerPopover
                            label="To"
                            value={customTo}
                            isOpen={activePicker === 'to'}
                            onToggle={() => setActivePicker(activePicker === 'to' ? null : 'to')}
                            onClose={() => setActivePicker(null)}
                            onChange={(val) => setCustomTo(val)}
                        />

                        <button
                            type="submit"
                            className="px-4.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer font-display"
                        >
                            🔍 Apply Date Search
                        </button>

                        {(customFrom || customTo) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCustomFrom('');
                                    setCustomTo('');
                                    setActivePicker(null);
                                    setSalesPage(1);
                                    setUndeliveredPage(1);
                                    router.get('/admin/reports', { filter: 'monthly', tab: activeTab });
                                }}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                Reset Dates
                            </button>
                        )}
                    </form>

                    {/* Quick Range Presets */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">Presets:</span>
                        {[
                            { key: 'day', label: 'Daily' },
                            { key: 'weekly', label: 'Weekly' },
                            { key: 'monthly', label: 'Monthly' },
                        ].map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => {
                                    setCustomFrom('');
                                    setCustomTo('');
                                    setActivePicker(null);
                                    handleFilterChange(f.key);
                                }}
                                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap font-display ${
                                    selectedFilter === f.key && !customFrom && !customTo
                                        ? 'bg-white text-orange-600 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 print:hidden">
                <button
                    onClick={() => {
                        setActiveTab('sales');
                        router.get('/admin/reports', { filter: selectedFilter, tab: 'sales', date: singleDate, from_date: customFrom, to_date: customTo }, { preserveState: true });
                    }}
                    className={`px-5 py-2.5 text-xs font-extrabold font-display transition-all border-b-2 cursor-pointer ${
                        activeTab === 'sales'
                            ? 'border-orange-600 text-orange-600'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    📊 Sales & Revenue Analytics
                </button>
                <button
                    onClick={() => {
                        setActiveTab('undelivered');
                        router.get('/admin/reports', { filter: selectedFilter, tab: 'undelivered', date: singleDate, from_date: customFrom, to_date: customTo }, { preserveState: true });
                    }}
                    className={`px-5 py-2.5 text-xs font-extrabold font-display transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                        activeTab === 'undelivered'
                            ? 'border-orange-600 text-orange-600'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <span>🚚 Undelivered Items Audit</span>
                    {undelivered_summary.on_hold_flagged > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse">
                            {undelivered_summary.on_hold_flagged} Issue
                        </span>
                    )}
                </button>
            </div>

            {/* TAB 1: Sales & Revenue Analytics */}
            {activeTab === 'sales' && (
                <div className="space-y-6">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                                {currencySymbol}{parseFloat(summary.total_revenue).toFixed(2)}
                            </p>
                            <p className="text-[11px] font-bold text-emerald-600">Total non-cancelled orders value</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Orders</span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                                {summary.total_orders}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500">{summary.completed_orders} completed / {summary.cancelled_orders} cancelled</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Average Order Value (AOV)</span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                                {currencySymbol}{parseFloat(summary.avg_order_value).toFixed(2)}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500">Per valid customer booking</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Payment Settlement</span>
                            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-display">
                                {currencySymbol}{parseFloat(summary.payment?.paid_amount || 0).toFixed(2)}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500">{summary.payment?.paid_count} settled orders</p>
                        </div>
                    </div>

                    {/* Middle Row: Payment Breakdown & Service Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Payment Settlement Status Breakdown */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">Payment Status Breakdown</h3>
                            
                            <div className="space-y-3">
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-extrabold text-emerald-900 block">Paid & Settled</span>
                                        <span className="text-[11px] text-emerald-700 font-medium">{summary.payment?.paid_count} orders completed</span>
                                    </div>
                                    <span className="text-lg font-black text-emerald-800 font-display">
                                        {currencySymbol}{parseFloat(summary.payment?.paid_amount || 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-extrabold text-orange-900 block">Cash on Delivery (COD In-Transit)</span>
                                        <span className="text-[11px] text-orange-700 font-medium">{summary.payment?.cod_pending_count} orders out for delivery</span>
                                    </div>
                                    <span className="text-lg font-black text-orange-800 font-display">
                                        {currencySymbol}{parseFloat(summary.payment?.cod_pending_amount || 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-extrabold text-slate-900 block">Unpaid / Processing</span>
                                        <span className="text-[11px] text-slate-600 font-medium">{summary.payment?.unpaid_count} orders on floor</span>
                                    </div>
                                    <span className="text-lg font-black text-slate-800 font-display">
                                        {currencySymbol}{parseFloat(summary.payment?.unpaid_amount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Service Category Performance */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">Category Revenue Breakdown</h3>

                            {category_stats.length === 0 ? (
                                <p className="text-xs text-slate-500 font-medium text-center py-6">No service category data for selected range.</p>
                            ) : (
                                <div className="space-y-4">
                                    {category_stats.map((cat) => (
                                        <div key={cat.category_name} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                                                <span>{cat.category_name}</span>
                                                <span>{currencySymbol}{parseFloat(cat.total_sales).toFixed(2)} ({cat.item_count} items)</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (parseFloat(cat.total_sales) / (summary.total_revenue || 1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filtered Sales Orders Table */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">Filtered Sales Orders List</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold font-display">
                                        <th className="pb-3 px-3">Order ID</th>
                                        <th className="pb-3 px-3">Customer</th>
                                        <th className="pb-3 px-3">Area</th>
                                        <th className="pb-3 px-3">Status</th>
                                        <th className="pb-3 px-3">Driver</th>
                                        <th className="pb-3 px-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedSalesOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-6 text-center text-slate-500 font-medium">No sales orders found for this period.</td>
                                        </tr>
                                    ) : (
                                        paginatedSalesOrders.map((o) => (
                                            <tr key={o.id} className="hover:bg-slate-50/60 font-semibold text-slate-800">
                                                <td className="py-3 px-3 font-extrabold text-slate-900">
                                                    <Link href={`/admin/orders/${o.id}`} className="text-orange-600 hover:underline">
                                                        #{o.id}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div>
                                                        <p className="font-extrabold text-slate-900">{o.user?.name || 'Customer'}</p>
                                                        <p className="text-[10px] text-slate-400">{o.user?.phone}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">{o.address?.service_area?.name || 'Standard Zone'}</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">{o.driver?.user?.name || 'Unassigned'}</td>
                                                <td className="py-3 px-3 text-right font-extrabold text-slate-900 font-display">
                                                    {currencySymbol}{parseFloat(o.total).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <TablePagination
                            currentPage={salesPage}
                            totalItems={orders.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => setSalesPage(p)}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: Undelivered Items & Delayed Orders Audit */}
            {activeTab === 'undelivered' && (
                <div className="space-y-6">
                    {/* Undelivered KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Undelivered Runs</span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                                {undelivered_summary.total_undelivered}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500">Live order pipeline</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                                Flagged Issues (On Hold)
                            </span>
                            <p className="text-2xl sm:text-3xl font-black text-rose-800 font-display">
                                {undelivered_summary.on_hold_flagged}
                            </p>
                            <p className="text-[11px] font-bold text-rose-600">Action required by facility staff</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-orange-200 bg-orange-50/40 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-orange-700 uppercase tracking-wider">Out For Delivery</span>
                            <p className="text-2xl sm:text-3xl font-black text-orange-800 font-display">
                                {undelivered_summary.out_for_delivery}
                            </p>
                            <p className="text-[11px] font-bold text-orange-600">With driver on route</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-2xs space-y-1">
                            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">Facility Floor Processing</span>
                            <p className="text-2xl sm:text-3xl font-black text-blue-800 font-display">
                                {undelivered_summary.in_processing}
                            </p>
                            <p className="text-[11px] font-bold text-blue-600">Washing, Drying & QC</p>
                        </div>
                    </div>

                    {/* Detailed Undelivered Items Audit Table */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-display">
                                Active In-Transit & Undelivered Items Audit Table
                            </h3>
                            <span className="text-xs text-slate-500 font-semibold">Priority: Flagged Issues First</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold font-display">
                                        <th className="pb-3 px-3">Order ID</th>
                                        <th className="pb-3 px-3">Customer</th>
                                        <th className="pb-3 px-3">Current Stage</th>
                                        <th className="pb-3 px-3">Garments Count</th>
                                        <th className="pb-3 px-3">Driver Assigned</th>
                                        <th className="pb-3 px-3">Slot Date</th>
                                        <th className="pb-3 px-3 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedUndelivered.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                                                🎉 All clear! No undelivered or pending items in queue.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUndelivered.map((item) => {
                                            const isHold = item.status === 'on_hold';
                                            const isOut = item.status === 'out_for_delivery';

                                            return (
                                                <tr key={item.id} className={`hover:bg-slate-50/60 font-semibold text-slate-800 ${isHold ? 'bg-rose-50/30' : ''}`}>
                                                    <td className="py-3.5 px-3 font-extrabold">
                                                        <Link href={`/admin/orders/${item.id}`} className="text-orange-600 hover:underline">
                                                            #{item.id}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <div>
                                                            <p className="font-extrabold text-slate-900">{item.user?.name || 'Customer'}</p>
                                                            <p className="text-[10px] text-slate-400">{item.user?.phone}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                            isHold
                                                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                                : isOut
                                                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {isHold && <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>}
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-3 font-extrabold font-mono">
                                                        {item.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1} items
                                                    </td>
                                                    <td className="py-3.5 px-3 font-extrabold">
                                                        {item.driver?.user?.name ? (
                                                            <span className="text-slate-900">🚚 {item.driver.user.name}</span>
                                                        ) : (
                                                            <span className="text-slate-400 font-normal">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-3 font-mono text-[11px]">
                                                        {item.time_slot?.date ? item.time_slot.date.slice(0, 10) : '—'}
                                                    </td>
                                                    <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 font-display">
                                                        {currencySymbol}{parseFloat(item.total).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <TablePagination
                            currentPage={undeliveredPage}
                            totalItems={undelivered.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(p) => setUndeliveredPage(p)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

ReportsIndex.layout = (page) => (
    <AdminLayout>
        {page}
    </AdminLayout>
);
