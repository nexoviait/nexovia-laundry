import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function OtpHandover({ tasks = [], driver }) {
    const { props: pageProps } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[pageProps.settings?.currency || 'GBP'] || '£';

    const [selectedTaskId, setSelectedTaskId] = useState(tasks.find(t => t.status === 'en_route')?.id || tasks[0]?.id || '');

    const selectedTask = tasks.find(t => t.id === Number(selectedTaskId));

    const deliverForm = useForm({
        otp: '',
        payment_method: 'cash',
        cod_amount: selectedTask?.order?.total || 0,
    });

    function handleTaskSelect(taskId) {
        setSelectedTaskId(taskId);
        const t = tasks.find(item => item.id === Number(taskId));
        deliverForm.setData({
            otp: '',
            payment_method: 'cash',
            cod_amount: t?.order?.total || 0,
        });
    }

    function handleStartDelivery(taskId) {
        router.post(`/driver/tasks/${taskId}/start-delivery`, {}, { preserveScroll: true });
    }

    function handleDeliver(e, taskId) {
        e.preventDefault();
        deliverForm.post(`/driver/tasks/${taskId}/deliver`, {
            preserveScroll: true,
            onSuccess: () => {
                deliverForm.reset();
            },
        });
    }

    const enRouteCount = tasks.filter(t => t.status === 'en_route').length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                        Secure Customer Handover
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">OTP Handover</h1>
                <p className="text-sm text-slate-600 font-medium mt-0.5">Verify 4-digit customer codes and collect payments upon delivery.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-slate-900">{tasks.length}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Total Deliveries</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-orange-600">{enRouteCount}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">En Route (Live OTP)</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-2xs">
                    <p className="text-xl sm:text-2xl font-black text-slate-700">{pendingCount}</p>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Awaiting Transit</p>
                </div>
            </div>

            {/* Quick Verification Panel */}
            {selectedTask && (
                <div className="rounded-3xl border border-orange-200 bg-orange-50/30 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100 pb-3">
                        <div>
                            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block">Selected Task</span>
                            <p className="text-base font-bold text-slate-900">{selectedTask.order?.user?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-600 font-semibold">{selectedTask.order?.address?.postcode} • Order #{selectedTask.order?.id}</p>
                        </div>
                        <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            selectedTask.status === 'en_route'
                                ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                            {selectedTask.status === 'en_route' ? '● Live En Route' : 'Pending Transit'}
                        </span>
                    </div>

                    {selectedTask.status === 'pending' ? (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                            <p className="text-xs text-slate-600 font-medium">
                                This order is awaiting transit start. Start transit to generate and send the 4-digit OTP to the customer via SMS.
                            </p>
                            <button
                                type="button"
                                onClick={() => handleStartDelivery(selectedTask.id)}
                                className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 shadow-2xs transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Start Transit & Send OTP to Customer
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => handleDeliver(e, selectedTask.id)} noValidate className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                    Enter 4-Digit Customer OTP
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    maxLength="4"
                                    placeholder="_ _ _ _"
                                    value={deliverForm.data.otp}
                                    onChange={e => deliverForm.setData('otp', e.target.value)}
                                    className={`w-full bg-slate-50 border ${
                                        deliverForm.errors.otp
                                            ? 'border-rose-300 focus:border-rose-500'
                                            : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                                    } focus:bg-white focus:ring-2 rounded-xl py-3 px-3 text-2xl font-black text-slate-900 tracking-[0.5em] text-center focus:outline-none transition-colors`}
                                />
                                {deliverForm.errors.otp && (
                                    <p className="text-xs text-rose-600 font-bold text-center">{deliverForm.errors.otp}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Invoice Amount</span>
                                    <p className="text-base font-black text-slate-900">{currencySymbol}{parseFloat(selectedTask.order?.total || 0).toFixed(2)}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Cash Collected ({currencySymbol})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={deliverForm.data.cod_amount}
                                        onChange={e => deliverForm.setData('cod_amount', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={deliverForm.processing || !deliverForm.data.otp}
                                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 shadow-2xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {deliverForm.processing ? 'Verifying Code...' : 'Verify OTP & Finalize Delivery'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Delivery Tasks List */}
            {tasks.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-3 shadow-2xs">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                        <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">All Delivery Handovers Complete!</h3>
                    <p className="text-sm text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
                        You have no active deliveries requiring OTP verification right now.
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
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Delivery Tasks</h3>
                    {tasks.map(task => {
                        const isEnRoute = task.status === 'en_route';
                        const isSelected = selectedTaskId === task.id;

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleTaskSelect(task.id)}
                                className={`cursor-pointer rounded-2xl border bg-white p-4 shadow-2xs transition-all space-y-3 hover:border-orange-300 ${
                                    isSelected ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50/10' : 'border-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                            isEnRoute
                                                ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                                                : 'bg-slate-100 text-slate-700 border-slate-300'
                                        }`}>
                                            {isEnRoute ? '● Live En Route' : 'Pending Transit'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">Order #{task.order?.id}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{currencySymbol}{parseFloat(task.order?.total || 0).toFixed(2)}</span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-base font-bold text-slate-900">{task.order?.user?.name || 'Customer'}</p>
                                        <p className="text-xs text-slate-600 font-medium">{task.order?.address?.postcode || '—'}</p>
                                    </div>

                                    <Link
                                        href={`/driver/tasks/${task.id}`}
                                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                    >
                                        View Details →
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

OtpHandover.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
