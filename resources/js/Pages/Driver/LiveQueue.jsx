import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function LiveQueue({ tasks = [], driver }) {
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const enRouteTasks = tasks.filter(t => t.status === 'en_route');
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    const filteredTasks = tasks.filter(task => {
        if (filter === 'pickup') return task.type === 'pickup';
        if (filter === 'delivery') return task.type === 'delivery';
        return true;
    });

    function handleRefresh() {
        setRefreshing(true);
        router.reload({
            preserveScroll: true,
            onFinish: () => setRefreshing(false),
        });
    }

    return (
        <div className="space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                        <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                            Live Dispatch Queue
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Live Task Queue</h1>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">Real-time view of active tasks assigned to your shift.</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
                    >
                        <svg className={`h-4 w-4 text-slate-500 ${refreshing ? 'animate-spin text-orange-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-slate-900">{tasks.length}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Active Total</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-orange-600">{enRouteTasks.length}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">En Route</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-slate-700">{pendingTasks.length}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Pending</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit text-xs font-bold">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                        filter === 'all'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    All ({tasks.length})
                </button>
                <button
                    onClick={() => setFilter('pickup')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                        filter === 'pickup'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Collections ({tasks.filter(t => t.type === 'pickup').length})
                </button>
                <button
                    onClick={() => setFilter('delivery')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                        filter === 'delivery'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Deliveries ({tasks.filter(t => t.type === 'delivery').length})
                </button>
            </div>

            {/* Task Feed */}
            {filteredTasks.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-3 shadow-2xs">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                        <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">Live Queue Clear!</h3>
                    <p className="text-sm text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
                        {filter !== 'all'
                            ? `No active ${filter} tasks in queue right now.`
                            : 'You have no active pickup or delivery tasks pending right now.'}
                    </p>
                    <Link
                        href="/driver/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 mt-2"
                    >
                        ← Back to Today's Dashboard
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map(task => {
                        const isPickup  = task.type === 'pickup';
                        const isEnRoute = task.status === 'en_route';
                        const addressLine = [task.order?.address?.postcode, task.order?.address?.label].filter(Boolean).join(', ');
                        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine || '')}`;

                        return (
                            <div
                                key={task.id}
                                className={`rounded-2xl border bg-white p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 ${
                                    isEnRoute ? 'border-orange-300 ring-1 ring-orange-100' : 'border-slate-200'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                            isPickup
                                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                        }`}>
                                            {isPickup ? 'Collection' : 'Delivery'}
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                            isEnRoute
                                                ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                                                : 'bg-slate-100 text-slate-700 border-slate-300'
                                        }`}>
                                            {isEnRoute ? '● LIVE EN ROUTE' : 'PENDING'}
                                        </span>
                                        {task.order?.address?.serviceArea?.name && (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {task.order.address.serviceArea.name}
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-xs font-bold text-slate-400">#{task.id}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    {/* Customer info */}
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-slate-900">{task.order?.user?.name || 'Walk-in customer'}</p>
                                        {task.order?.user?.phone && (
                                            <a
                                                href={`tel:${task.order.user.phone}`}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
                                            >
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {task.order.user.phone}
                                            </a>
                                        )}
                                    </div>

                                    {/* Address & Slot info */}
                                    <div className="space-y-1 text-left sm:text-right">
                                        <a
                                            href={mapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                                        >
                                            <svg className="h-3.5 w-3.5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            <span>{task.order?.address?.postcode || 'No postcode'}</span>
                                        </a>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Slot: <span className="font-bold text-slate-700">{task.order?.timeSlot?.window || 'Flexible'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                                    <div className="text-xs text-slate-500 font-medium">
                                        Order <span className="font-bold text-slate-800">#{task.order?.id}</span>
                                        {task.order?.items?.length > 0 && ` • ${task.order.items.length} item(s)`}
                                    </div>

                                    <Link
                                        href={`/driver/tasks/${task.id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-2xs"
                                    >
                                        <span>Process Task</span>
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

LiveQueue.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
