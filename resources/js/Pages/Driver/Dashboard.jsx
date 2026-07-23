import { Link } from '@inertiajs/react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function Dashboard({ tasks, driver, today_date }) {
    const pendingCount  = tasks.filter(t => t.status === 'pending').length;
    const enRouteCount  = tasks.filter(t => t.status === 'en_route').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const failedCount   = tasks.filter(t => t.status === 'failed').length;

    const activeTasks    = tasks.filter(t => t.status !== 'completed' && t.status !== 'failed');
    const doneTasks      = tasks.filter(t => t.status === 'completed' || t.status === 'failed');

    const todayDisplay = new Date(today_date + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric',
    });

    return (
        <div className="space-y-5">
            {/* Driver stats card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
                {/* Driver info row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-extrabold text-orange-700 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
                                <span className="h-2 w-2 rounded-full bg-orange-500 inline-block animate-pulse"></span>
                                On Duty
                            </p>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight tracking-tight truncate">{driver.user?.name}</h1>
                            <p className="text-xs text-slate-600 font-bold font-mono mt-0.5">
                                {driver.vehicle_type?.toUpperCase()} • {driver.vehicle_number}
                            </p>
                        </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Today</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-800">{todayDisplay}</p>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 pt-4 border-t border-slate-100">
                    {[
                        { label: 'Pending',  count: pendingCount,   color: 'text-slate-900' },
                        { label: 'En Route', count: enRouteCount,   color: 'text-orange-600' },
                        { label: 'Done',     count: completedCount, color: 'text-emerald-600' },
                        { label: 'Failed',   count: failedCount,    color: 'text-rose-600' },
                    ].map(({ label, count, color }) => (
                        <div key={label} className="text-center">
                            <p className={`text-2xl sm:text-3xl font-black ${color}`}>{count}</p>
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active tasks */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                        Active Tasks ({activeTasks.length})
                    </h2>
                </div>

                {activeTasks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-sm">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900">All Clear!</h3>
                        <p className="text-sm text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
                            No active pickup or delivery tasks scheduled for your shift today.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </section>

            {/* Completed/Failed today */}
            {doneTasks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Completed Today ({doneTasks.length})
                        </h2>
                    </div>
                    <div className="space-y-2.5">
                        {doneTasks.map(task => (
                            <TaskCard key={task.id} task={task} dimmed />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function TaskCard({ task, dimmed = false }) {
    const isPickup  = task.type === 'pickup';
    const isDone    = task.status === 'completed';
    const isFailed  = task.status === 'failed';
    const isEnRoute = task.status === 'en_route';
    const isPending = task.status === 'pending';

    const statusConfig = {
        pending:   { label: 'Pending',   bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-300' },
        en_route:  { label: 'En Route',  bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
        completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-800',border: 'border-emerald-200' },
        failed:    { label: 'Failed',    bg: 'bg-rose-50',    text: 'text-rose-800',   border: 'border-rose-200' },
    };
    const st = statusConfig[task.status] || statusConfig.pending;

    return (
        <Link
            href={`/driver/tasks/${task.id}`}
            className={`block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-all group ${
                isFailed ? 'border-rose-200' : isEnRoute ? 'border-orange-300' : dimmed ? 'opacity-70 border-slate-200' : 'border-slate-200 hover:border-orange-300'
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Status/type icon */}
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isFailed ? 'bg-rose-50' : isDone ? 'bg-emerald-50' : isEnRoute ? 'bg-orange-100' : 'bg-slate-100'
                }`}>
                    {isFailed ? (
                        <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    ) : isDone ? (
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : isPickup ? (
                        <svg className={`h-5 w-5 ${isEnRoute ? 'text-orange-700' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                        </svg>
                    ) : (
                        <svg className={`h-5 w-5 ${isEnRoute ? 'text-orange-700' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                            {isPickup ? 'Collection' : 'Delivery'}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
                            {st.label}
                        </span>
                        {isEnRoute && (
                            <span className="text-xs font-bold text-orange-600 animate-pulse">● LIVE</span>
                        )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-orange-700 transition-colors">
                        {task.order?.user?.name || 'Walk-in customer'}
                    </h4>

                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold">
                        <svg className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">
                            {task.order?.address?.postcode}
                            {task.order?.address?.label ? ` — ${task.order.address.label}` : ''}
                        </span>
                    </div>

                    {isFailed && task.failure_reason ? (
                        <div className="flex items-center gap-1 text-sm text-rose-700 font-semibold">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <span className="truncate">{task.failure_reason}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                            <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Slot: {task.order?.time_slot?.window || 'Flexible'}</span>
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <svg className={`h-4 w-4 text-slate-400 self-center shrink-0 transition-colors ${!dimmed ? 'group-hover:text-orange-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}

Dashboard.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
