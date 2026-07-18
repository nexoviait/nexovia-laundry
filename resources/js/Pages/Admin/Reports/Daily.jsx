import { router, Link } from '@inertiajs/react';
import Layout from '@/Layouts/AdminLayout';
import { useMemo } from 'react';

export default function Daily({ date, summary, orders }) {
    const orderList = Array.isArray(orders) ? orders : (orders.data || []);

    // Format display date
    const formattedDate = useMemo(() => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }, [date]);

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Global Dashboard</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Monitoring performance across <span className="text-orange-600 font-extrabold">14 active</span> laundry hubs.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Date Picker Button styled like mock select */}
                    <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors">
                        <span className="mr-2">📅</span>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => router.get('/admin/reports/daily', { date: e.target.value })}
                            className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer focus:ring-0 p-0 text-xs"
                        />
                    </div>

                    {/* Export Data Button */}
                    <a
                        href={`/admin/reports/daily/export?date=${date}`}
                        className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-200 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <span>📥</span>
                        <span>Export Data</span>
                    </a>
                </div>
            </div>

            {/* Top 4 Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Total Revenue Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold">
                            💵
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ▲ 12.4%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Revenue</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">£{summary.revenue.toFixed(2)}</div>
                    </div>
                </div>

                {/* Active Users/Orders Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg font-bold">
                            👥
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ▲ 3.2%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Order Volume</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total_orders}</div>
                    </div>
                </div>

                {/* Order Volume Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                            🛍️
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ▲ 18.1%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Growth Index</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">24.8%</div>
                    </div>
                </div>

                {/* Cancelled/Growth Index Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">
                            ❌
                        </span>
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                            ▼ 5.5%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cancelled Orders</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.cancelled}</div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-8 lg:grid-cols-3 items-start">
                
                {/* Left Column: Weekly chart & Recent Activity table (2 columns) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Weekly Performance Bar Chart Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Weekly Revenue Performance</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Daily revenue breakdown compared to previous week.</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-orange-600"></span>
                                    <span>Current</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-100 border border-slate-200"></span>
                                    <span>Target</span>
                                </div>
                            </div>
                        </div>

                        {/* Custom SVG Bar Chart */}
                        <div className="relative h-60 w-full flex items-end justify-between px-4 pb-6 pt-4 border-b border-slate-100">
                            {/* SVG background columns */}
                            {[
                                { day: 'Mon', current: 70, target: 90 },
                                { day: 'Tue', current: 85, target: 95 },
                                { day: 'Wed', current: 65, target: 80 },
                                { day: 'Thu', current: 88, target: 92 },
                                { day: 'Fri', current: 90, target: 90 },
                                { day: 'Sat', current: 55, target: 75 },
                                { day: 'Sun', current: 48, target: 60 }
                            ].map((col, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="relative w-12 h-44 flex items-end justify-center rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                        {/* Target Bar (gray background slot) */}
                                        <div 
                                            className="absolute bottom-0 w-full bg-slate-100 transition-all duration-300"
                                            style={{ height: `${col.target}%` }}
                                        ></div>
                                        {/* Current Bar (blue overlay) */}
                                        <div 
                                            className="absolute bottom-0 w-full bg-orange-600 transition-all duration-300 rounded-t-lg"
                                            style={{ height: `${col.current}%` }}
                                        ></div>
                                        {/* Tooltip on hover */}
                                        <div className="absolute top-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                            {col.current}%
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent activity orders table */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Orders List for {formattedDate}</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">List of orders registered on this time slot schedule.</p>
                            </div>
                            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                                {orderList.length} total
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-semibold text-slate-500">
                                <thead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="pb-3 pr-2">Order ID</th>
                                        <th className="pb-3 px-2">Customer</th>
                                        <th className="pb-3 px-2">Area</th>
                                        <th className="pb-3 px-2 text-center">Status</th>
                                        <th className="pb-3 pl-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {orderList.map((o) => (
                                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 pr-2 font-bold text-slate-950">#{o.id}</td>
                                            <td className="py-3.5 px-2">
                                                <div className="font-bold text-slate-900">{o.user?.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{o.user?.phone}</div>
                                            </td>
                                            <td className="py-3.5 px-2">
                                                <span className="font-bold text-slate-800">{o.address?.service_area?.name || 'Main Area'}</span>
                                            </td>
                                            <td className="py-3.5 px-2 text-center">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                    o.status === 'cancelled'
                                                        ? 'bg-red-50 text-red-600'
                                                        : o.status === 'delivered'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 pl-2 text-right font-extrabold text-slate-950">
                                                £{parseFloat(o.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {orderList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                                                No orders scheduled for this date.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Notices (1 column) */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    
                    {/* Quick Actions Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Frequently used administrative tasks.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 pt-2">
                            {/* Action 1: New Service Area */}
                            <Link
                                href="/admin/service-areas"
                                className="flex flex-col items-center justify-center p-4 border border-slate-200 hover:border-orange-500 rounded-2xl hover:bg-orange-50/20 text-center transition-all group"
                            >
                                <span className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-700 text-lg transition-colors">
                                    ➕
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-900 mt-2 block">
                                    New Service Area
                                </span>
                            </Link>

                            {/* Action 2: Assign Driver */}
                            <Link
                                href="/admin/orders"
                                className="flex flex-col items-center justify-center p-4 border border-slate-200 hover:border-orange-500 rounded-2xl hover:bg-orange-50/20 text-center transition-all group"
                            >
                                <span className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-700 text-lg transition-colors">
                                    🚚
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-900 mt-2 block">
                                    Assign Driver
                                </span>
                            </Link>

                            {/* Action 3: Batch Invoicing */}
                            <Link
                                href="/admin/orders"
                                className="flex flex-col items-center justify-center p-4 border border-slate-200 hover:border-orange-500 rounded-2xl hover:bg-orange-50/20 text-center transition-all group"
                            >
                                <span className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-700 text-lg transition-colors">
                                    📋
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-900 mt-2 block">
                                    Batch Invoicing
                                </span>
                            </Link>

                            {/* Action 4: System Alert */}
                            <span
                                className="flex flex-col items-center justify-center p-4 border border-slate-200 hover:border-orange-500 rounded-2xl hover:bg-orange-50/20 text-center transition-all group cursor-pointer"
                            >
                                <span className="h-10 w-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-700 text-lg transition-colors">
                                    📢
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-900 mt-2 block">
                                    System Alert
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Maintenance Notice Card */}
                    <div className="rounded-3xl border border-orange-100 bg-orange-50/40 p-6 shadow-sm border-l-4 border-l-orange-600 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-800">
                            <span>ℹ️</span>
                            <span>Maintenance Notice</span>
                        </div>
                        <p className="text-[11px] text-orange-700 font-semibold leading-relaxed">
                            System-wide inventory audit scheduled for Saturday at 02:00 AM EST. Access may be limited.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

Daily.layout = (page) => <Layout children={page} />;
