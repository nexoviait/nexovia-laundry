import Layout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Revenue({ summary, branch_stats }) {
    const branches = useMemo(() => {
        return Array.isArray(branch_stats) ? branch_stats : [];
    }, [branch_stats]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Revenue Analytics</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Detailed operational breakdown of financial performance and billing metrics.
                    </p>
                </div>
            </div>

            {/* Top Cards Row */}
            <div className="grid gap-4 md:grid-cols-4">
                
                {/* Total Revenue Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold">
                            📊
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ▲ 12.5%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Revenue</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">£{summary.total_revenue.toFixed(2)}</div>
                    </div>
                </div>

                {/* Total Invoices Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg font-bold">
                            📃
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            ▲ 8.2%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Invoices</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total_invoices}</div>
                    </div>
                </div>

                {/* Avg Order Value Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex items-center justify-between">
                        <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                            ⏱️
                        </span>
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                            ▼ 1.4%
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg. Order Value</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">£{summary.avg_order_value.toFixed(2)}</div>
                    </div>
                </div>

                {/* Settlements Card (Solid Royal Blue) */}
                <div className="rounded-3xl bg-orange-600 text-white p-5 shadow-md shadow-orange-200 flex flex-col justify-between h-36 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="h-9 w-9 rounded-lg bg-white/10 text-white flex items-center justify-center text-base font-bold">
                            💳
                        </span>
                        <button type="button" className="text-[10px] font-bold text-orange-100 hover:text-white transition-colors">
                            Export All
                        </button>
                    </div>
                    <div>
                        <div className="text-[9px] font-extrabold text-orange-200 uppercase tracking-wider">Pending Settlements</div>
                        <div className="text-2xl font-extrabold mt-1">£{summary.pending_settlements.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-8 lg:grid-cols-3 items-start">
                
                {/* Left Column: Revenue Growth Line Chart & Branch Table (2 columns) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Revenue Growth Line Chart Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Revenue Growth</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Monthly financial trends across all services.</p>
                            </div>
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                                <button type="button" className="px-3 py-1.5 text-[10px] font-bold text-slate-500 rounded-lg hover:text-slate-800">
                                    Last 6 Months
                                </button>
                                <button type="button" className="px-3 py-1.5 text-[10px] font-extrabold text-white bg-orange-600 rounded-lg shadow-sm">
                                    Yearly
                                </button>
                            </div>
                        </div>

                        {/* Custom SVG Line Chart */}
                        <div className="relative h-60 w-full flex items-end">
                            {/* Y Axis Labels */}
                            <div className="flex flex-col justify-between h-48 text-[9px] font-bold text-slate-400 select-none pr-3">
                                <span>£35k</span>
                                <span>£30k</span>
                                <span>£25k</span>
                                <span>£20k</span>
                                <span>£15k</span>
                                <span>£10k</span>
                                <span>£5k</span>
                                <span>£0k</span>
                            </div>

                            <div className="flex-1 h-48 relative border-l border-b border-slate-100">
                                {/* SVG Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="w-full border-t border-slate-50/60 h-0"></div>
                                    ))}
                                </div>

                                {/* Curve SVG */}
                                <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Filled Area */}
                                    <path 
                                        d="M 5,75 C 20,68 30,68 45,71 C 60,74 75,55 85,58 C 90,60 95,50 100,45 L 100,100 L 5,100 Z" 
                                        fill="url(#chartGradient)" 
                                    />
                                    
                                    {/* Line Curve */}
                                    <path 
                                        d="M 5,75 C 20,68 30,68 45,71 C 60,74 75,55 85,58 C 90,60 95,50 100,45" 
                                        fill="none" 
                                        stroke="#f97316" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round"
                                    />

                                    {/* Circular Dots */}
                                    <circle cx="5" cy="75" r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                                    <circle cx="30" cy="68" r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                                    <circle cx="50" cy="71" r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                                    <circle cx="75" cy="55" r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                                    <circle cx="85" cy="58" r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                                    <circle cx="100" cy="45" r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                                </svg>
                                
                                {/* X Axis Labels */}
                                <div className="absolute top-[102%] inset-x-0 flex justify-between text-[10px] font-bold text-slate-400 px-1">
                                    <span>Jan</span>
                                    <span>Feb</span>
                                    <span>Mar</span>
                                    <span>Apr</span>
                                    <span>May</span>
                                    <span>Jun</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branch Performance table */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Branch Performance</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Revenue and orders statistics by service area.</p>
                            </div>
                            <div className="flex gap-4 text-xs font-bold text-orange-600">
                                <a href="#" className="hover:underline">📥 PDF</a>
                                <a href="#" className="hover:underline">📥 CSV</a>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-semibold text-slate-500">
                                <thead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="pb-3 pr-2">Branch Location</th>
                                        <th className="pb-3 px-2">Revenue</th>
                                        <th className="pb-3 px-2">Growth</th>
                                        <th className="pb-3 px-2 text-center">Status</th>
                                        <th className="pb-3 pl-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {branches.map((b, idx) => {
                                        // Dynamic/mock growth index tags
                                        const growth = idx === 0 ? '+14.2%' : idx === 1 ? '+5.8%' : idx === 2 ? '-2.1%' : '+11.4%';
                                        
                                        const badgeClass = idx === 0
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : idx === 1
                                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                                            : idx === 2
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-teal-50 text-teal-600 border-teal-100';

                                        const statusLabel = idx === 0
                                            ? 'Top Performing'
                                            : idx === 1
                                            ? 'Stable'
                                            : idx === 2
                                            ? 'Under Target'
                                            : 'Growing';

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3.5 pr-2 font-bold text-slate-900">{b.branch_name}</td>
                                                <td className="py-3.5 px-2 font-extrabold text-slate-950">£{parseFloat(b.total_revenue).toFixed(2)}</td>
                                                <td className={`py-3.5 px-2 font-bold ${idx === 2 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {growth}
                                                </td>
                                                <td className="py-3.5 px-2 text-center">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold border ${badgeClass}`}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pl-2 text-right text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold">
                                                    ⋮
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {branches.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                                                No active branch performance data registered.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Service Distribution Doughnut & Financial Alerts (1 column) */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    
                    {/* Service Distribution doughnut */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Service Distribution</h3>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Revenue breakdown by type</p>
                        </div>

                        {/* Doughnut SVG */}
                        <div className="flex flex-col items-center justify-center pt-2">
                            <div className="relative h-40 w-40 flex items-center justify-center">
                                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                    {/* Base background circle */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                    
                                    {/* Slice 1: Wash & Fold (45%) -> Blue */}
                                    <circle 
                                        cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="3.2" 
                                        strokeDasharray="45 55" strokeDashoffset="0"
                                    />
                                    {/* Slice 2: Dry Cleaning (30%) -> Sky */}
                                    <circle 
                                        cx="18" cy="18" r="15.915" fill="none" stroke="#0ea5e9" strokeWidth="3.2" 
                                        strokeDasharray="30 70" strokeDashoffset="-45"
                                    />
                                    {/* Slice 3: B2B Contract (25%) -> Green */}
                                    <circle 
                                        cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" 
                                        strokeDasharray="25 75" strokeDashoffset="-75"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total</span>
                                    <p className="text-base font-extrabold text-slate-900 mt-0.5">100%</p>
                                </div>
                            </div>

                            {/* Legend labels details */}
                            <div className="w-full space-y-3 pt-6 text-xs font-bold text-slate-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-orange-600"></span>
                                        <span className="text-slate-900">Wash & Fold</span>
                                    </div>
                                    <span>45%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-sky-500"></span>
                                        <span className="text-slate-900">Dry Cleaning</span>
                                    </div>
                                    <span>30%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                                        <span className="text-slate-900">B2B Contract</span>
                                    </div>
                                    <span>25%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Alerts box */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Financial Alerts</h4>
                        
                        <div className="space-y-3.5">
                            
                            {/* Alert 1: Overdue Payments */}
                            <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 flex gap-3">
                                <span className="text-red-500 text-sm">⚠️</span>
                                <div>
                                    <p className="text-xs font-bold text-red-950">Delayed Payments</p>
                                    <p className="text-[10px] text-red-700 font-semibold mt-0.5 leading-relaxed">
                                        3 B2B invoices are overdue by 15+ days.
                                    </p>
                                </div>
                            </div>

                            {/* Alert 2: Target Achieved */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 flex gap-3">
                                <span className="text-emerald-500 text-sm">✓</span>
                                <div>
                                    <p className="text-xs font-bold text-emerald-950">Target Achieved</p>
                                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 leading-relaxed">
                                        June revenue target surpassed by 12%.
                                    </p>
                                </div>
                            </div>

                            {/* Alert 3: System Audit */}
                            <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 flex gap-3">
                                <span className="text-orange-500 text-sm">ℹ️</span>
                                <div>
                                    <p className="text-xs font-bold text-orange-950">System Audit</p>
                                    <p className="text-[10px] text-orange-700 font-semibold mt-0.5 leading-relaxed">
                                        Weekly financial audit scheduled for tonight.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className="w-full rounded-xl border border-orange-600 hover:bg-orange-50 text-orange-600 font-bold py-2.5 text-xs transition-colors mt-2"
                        >
                            View All Alerts
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

Revenue.layout = (page) => <Layout children={page} />;
