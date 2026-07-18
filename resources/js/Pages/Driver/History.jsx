import { Link } from '@inertiajs/react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function History({ history, driver }) {
    const completedTasks = history.filter(t => t.status === 'completed');
    const failedTasks    = history.filter(t => t.status === 'failed');

    return (
        <div className="space-y-5">
            {/* Summary header */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <p className="text-[11px] font-extrabold text-orange-600 uppercase tracking-widest mb-1">Task History</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-[-0.02em]">Past Dispatch Runs</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Last 50 completed and failed tasks</p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div>
                        <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Completed</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-rose-600">{failedTasks.length}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Failed</p>
                    </div>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-700">No History Yet</h3>
                    <p className="text-xs text-slate-400 font-semibold">Completed and failed tasks will appear here.</p>
                    <Link href="/driver/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 mt-1">
                        ← Back to Dashboard
                    </Link>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {history.map(task => {
                        const isPickup    = task.type === 'pickup';
                        const isCompleted = task.status === 'completed';
                        const dateLabel   = task.completed_at
                            ? new Date(task.completed_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : task.scheduled_at
                            ? new Date(task.scheduled_at).toLocaleString(undefined, { month: 'short', day: 'numeric' })
                            : '—';

                        return (
                            <Link
                                key={task.id}
                                href={`/driver/tasks/${task.id}`}
                                className="block rounded-3xl border bg-white p-4 shadow-sm hover:shadow-md transition-all group border-slate-100 hover:border-slate-200"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        isCompleted ? 'bg-emerald-50' : 'bg-rose-50'
                                    }`}>
                                        {isCompleted ? (
                                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                isPickup
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            }`}>
                                                {isPickup ? 'Collection' : 'Delivery'}
                                            </span>
                                            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                isCompleted
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                                {isCompleted ? 'Done' : 'Failed'}
                                            </span>
                                        </div>
                                        <h4 className="font-normal text-slate-700 text-base truncate">
                                            {task.order?.user?.name || 'Walk-in customer'}
                                        </h4>
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <p className="text-sm text-slate-400 font-medium truncate">
                                                {task.order?.address?.postcode}
                                            </p>
                                            <span className="text-sm text-slate-400 font-medium shrink-0">{dateLabel}</span>
                                        </div>
                                        {!isCompleted && task.failure_reason && (
                                            <p className="text-sm text-rose-500 font-medium italic truncate">
                                                "{task.failure_reason}"
                                            </p>
                                        )}
                                    </div>

                                    <svg className="h-4 w-4 text-slate-200 self-center shrink-0 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

History.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
