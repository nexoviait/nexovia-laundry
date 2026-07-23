import CustomerLayout from '@/Layouts/CustomerLayout';
import { Link, router, usePage } from '@inertiajs/react';

const STATUS_LABELS = {
    pending: 'Awaiting Confirmation',
    confirmed: 'Confirmed',
    assigned: 'Driver Assigned',
    picked_up: 'Collected',
    processing: 'Washing & Drying',
    on_hold: 'On Hold',
    ready: 'Folded & Ready',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    rated: 'Delivered',
    cancelled: 'Cancelled',
};

const STEPPER_STAGES = [
    { key: 'picked_up', label: 'Collected' },
    { key: 'processing', label: 'Washing' },
    { key: 'ready', label: 'Drying & Folded' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
];

function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStageIndex(status) {
    if (status === 'picked_up') return 0;
    if (status === 'processing') return 1;
    if (status === 'ready') return 2;
    if (status === 'out_for_delivery') return 3;
    if (status === 'delivered' || status === 'rated') return 4;
    return 0;
}

export default function Dashboard({ orders }) {
    const { props } = usePage();
    const customerName = props.auth?.user?.name || 'Customer';
    const currency = props.settings?.currency || 'GBP';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

    const activeOrders = orders.data.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rated');
    const pastOrders = orders.data.filter((o) => o.status === 'delivered' || o.status === 'cancelled' || o.status === 'rated');

    const latestOrder = orders.data[0];
    const washesCount = pastOrders.length % 10 || 7;

    return (
        <CustomerLayout>
            <div className="space-y-8 animate-fade-in pb-12">
                {/* Hero Greeting Card - Vibrant Premium Banner */}
                <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-orange-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
                    {/* Glowing ambient background circle */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>

                    <div className="space-y-2.5 max-w-xl relative z-10">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] sm:text-[11px] font-extrabold text-white border border-white/20 uppercase tracking-widest backdrop-blur-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                            Overview & Live Status
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight font-display">
                            Hello, {customerName}!<br />
                            <span className="text-amber-100 font-extrabold">Ready for a fresh start?</span>
                        </h1>
                        <p className="text-orange-50 text-xs sm:text-sm font-semibold leading-relaxed max-w-md">
                            Schedule a home laundry collection or track your live orders straight to your door.
                        </p>
                    </div>

                    <Link
                        href="/book"
                        id="btn-hero-book-now"
                        className="rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-orange-600 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold shadow-lg shadow-orange-950/20 hover:shadow-xl transition-all duration-200 shrink-0 flex items-center justify-center gap-2 font-display tracking-wide w-full sm:w-auto relative z-10 cursor-pointer"
                    >
                        <span>Book Now</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>

                {/* Middle Grid: Active Order Progress & Loyalty Ring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    
                    {/* Left 2 Cols: Active Order Progress Stepper & Quick Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <div className="label-micro mb-0.5">Active Order Track</div>
                                    <h3 className="heading-section">Active Orders</h3>
                                    {activeOrders.length > 0 ? (
                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                            <span className="text-base sm:text-xl font-extrabold text-slate-900 font-display">Order #{activeOrders[0].id}</span>
                                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-amber-700 border border-amber-200/80 font-display whitespace-nowrap">
                                                • {STATUS_LABELS[activeOrders[0].status]}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 font-medium mt-1">No live laundry runs right now.</p>
                                    )}
                                </div>
                                <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-extrabold font-display border border-orange-200/60">
                                    {activeOrders.length}
                                </span>
                            </div>

                            {/* Horizontal Progress Stepper Bar */}
                            {activeOrders.length > 0 ? (
                                <div className="space-y-4 pt-2">
                                    <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.max(15, ((getStageIndex(activeOrders[0].status) + 1) / 5) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-5 text-center gap-1">
                                        {STEPPER_STAGES.map((stage, idx) => {
                                            const activeIdx = activeOrders.length > 0 ? getStageIndex(activeOrders[0].status) : -1;
                                            const completed = idx <= activeIdx;
                                            return (
                                                <div key={stage.key} className="space-y-1">
                                                    <span className={`inline-flex h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full items-center justify-center text-[9px] sm:text-[10px] font-bold mx-auto ${
                                                        completed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {completed ? '✓' : idx + 1}
                                                    </span>
                                                    <p className={`text-[10px] sm:text-xs font-extrabold block leading-tight ${completed ? 'text-slate-900 font-display' : 'text-slate-400'}`}>
                                                        {stage.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-xs font-medium">
                                    Your basket is empty. Click "Book Now" above to schedule a collection!
                                </div>
                            )}
                        </div>

                        {/* Quick Actions Cards */}
                        <div className="space-y-3">
                            <h3 className="label-micro">Quick Actions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <Link
                                    href={latestOrder ? `/book?reorder_id=${latestOrder.id}` : '/book'}
                                    className="bg-white border border-slate-200/80 hover:border-orange-300 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all text-center space-y-1.5 group"
                                >
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg sm:text-xl mx-auto group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                        🛒 ↻
                                    </div>
                                    <h4 className="heading-section text-xs sm:text-base">Reorder Last Wash</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Repeat Order #{latestOrder?.id || 'Recent'}</p>
                                </Link>

                                <Link
                                    href="/addresses"
                                    className="bg-white border border-slate-200/80 hover:border-orange-300 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all text-center space-y-1.5 group"
                                >
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg sm:text-xl mx-auto group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                        📍
                                    </div>
                                    <h4 className="heading-section text-xs sm:text-base">Add New Address</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Manage saved locations</p>
                                </Link>

                                <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-2xs text-center space-y-1.5">
                                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-xl mx-auto border border-amber-200/60">
                                        ★
                                    </div>
                                    <h4 className="heading-section text-xs sm:text-base">View Rewards</h4>
                                    <p className="text-[11px] text-amber-700 font-bold font-display">{washesCount}/10 to Free Wash</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Loyalty Ring Widget */}
                    <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between items-center text-center">
                        <div className="w-full text-left">
                            <div className="label-micro mb-0.5">COMPLETED (YTD)</div>
                            <h3 className="heading-section text-sm sm:text-base">Loyalty Widget</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Earn 1 free wash every 10 runs!</p>
                        </div>

                        {/* Circular Progress Ring Gauge */}
                        <div className="relative my-4 sm:my-6 flex items-center justify-center">
                            <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="48"
                                    stroke="#f1f5f9"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="sm:hidden"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="48"
                                    stroke="#3b82f6"
                                    strokeWidth="8"
                                    strokeDasharray={301.5}
                                    strokeDashoffset={301.5 - (301.5 * (washesCount / 10))}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="transition-all duration-1000 sm:hidden"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="60"
                                    stroke="#f1f5f9"
                                    strokeWidth="10"
                                    fill="transparent"
                                    className="hidden sm:block"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="60"
                                    stroke="#3b82f6"
                                    strokeWidth="10"
                                    strokeDasharray={376.8}
                                    strokeDashoffset={376.8 - (376.8 * (washesCount / 10))}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="transition-all duration-1000 hidden sm:block"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="metric-number text-2xl sm:text-3xl">{washesCount}/10</span>
                                <span className="label-micro text-[9px] sm:text-[10px] mt-0.5">Washes</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 text-center">
                            <span className="block heading-section text-xs">Free Wash</span>
                            <span className="text-[11px] text-slate-500 font-medium">Reward Status: Active</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <div className="label-micro mb-0.5">TIMELINE</div>
                            <h3 className="heading-section text-sm sm:text-base">Recent Activity</h3>
                        </div>
                        <Link href="/dashboard" className="text-xs font-bold text-orange-600 hover:text-orange-700 font-display flex items-center gap-1 tracking-wide">
                            View All →
                        </Link>
                    </div>

                    {orders.data.length === 0 ? (
                        <p className="text-xs text-slate-500 font-medium text-center py-4">No recent laundry activity.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {orders.data.slice(0, 4).map((order) => (
                                <div key={order.id} className="py-3 flex items-center justify-between gap-2 text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 font-display">
                                            Order #{order.id}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {formatDate(order.time_slot?.date) || 'Recent Run'}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold font-display whitespace-nowrap ${
                                            order.status === 'delivered' || order.status === 'rated'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                                : order.status === 'cancelled'
                                                ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                                                : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                        }`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-extrabold text-xs sm:text-base text-slate-900 font-display">
                                            {currencySymbol}{parseFloat(order.total).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}


