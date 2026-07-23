import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function TaskShow({ task, driver }) {
    const { props: pageProps } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[pageProps.settings?.currency || 'GBP'] || '£';

    const [showFailPanel, setShowFailPanel] = useState(false);
    const [photoPreviews, setPhotoPreviews]  = useState([]);

    // Forms
    const pickupForm = useForm({
        item_count: task.order?.items?.reduce((acc, curr) => acc + parseFloat(curr.qty || 0), 0) || 0,
        weight: '',
        photos: [],
    });

    const deliverForm = useForm({
        otp: '',
        payment_method: 'cash',
        cod_amount: task.order?.total || 0,
    });

    const failForm = useForm({ reason: '' });

    // Handlers
    function handleStartDelivery() {
        router.post(`/driver/tasks/${task.id}/start-delivery`, {}, { preserveScroll: true });
    }

    function handlePickup(e) {
        e.preventDefault();
        pickupForm.post(`/driver/tasks/${task.id}/pickup`);
    }

    function handleDeliver(e) {
        e.preventDefault();
        deliverForm.post(`/driver/tasks/${task.id}/deliver`);
    }

    function handleFail(e) {
        e.preventDefault();
        failForm.post(`/driver/tasks/${task.id}/fail`);
    }

    function handlePhotoChange(e) {
        const files = Array.from(e.target.files);
        pickupForm.setData('photos', files);
        const previews = files.map(f => URL.createObjectURL(f));
        setPhotoPreviews(previews);
    }

    // State flags
    const isPickup    = task.type === 'pickup';
    const isPending   = task.status === 'pending';
    const isEnRoute   = task.status === 'en_route';
    const isCompleted = task.status === 'completed';
    const isFailed    = task.status === 'failed';

    // Map link
    const addressLine = [
        task.order?.address?.label,
        task.order?.address?.postcode,
    ].filter(Boolean).join(', ');

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine || task.order?.address?.postcode || '')}`;

    // Progress steps
    const steps = isPickup
        ? [
            { label: 'Assigned',   done: true },
            { label: 'En Route',   done: isCompleted },
            { label: 'Collected',  done: isCompleted },
        ]
        : [
            { label: 'Ready',      done: true },
            { label: 'En Route',   done: isEnRoute || isCompleted },
            { label: 'Delivered',  done: isCompleted },
        ];

    return (
        <div className="space-y-4 pb-4">
            {/* Back + ref header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/driver/dashboard"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Dashboard
                </Link>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                    #{task.id} · {isPickup ? 'Collection' : 'Delivery'}
                </span>
            </div>

            {/* Task header card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPickup ? 'bg-slate-100' : 'bg-orange-50'
                    }`}>
                        {isPickup ? (
                            <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                {isPickup ? 'Collection Job' : 'Delivery Handover'}
                            </h2>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                                isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isFailed   ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : isEnRoute  ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                                :              'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                                {task.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Slot: {task.order?.time_slot?.window || 'Flexible'}
                        </p>
                    </div>
                </div>

                {/* Progress steps */}
                <div className="flex items-center gap-0 pt-1">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                                    step.done
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                    {step.done ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : i + 1}
                                </div>
                                <span className="text-xs font-bold text-slate-700 mt-1.5 text-center leading-tight">{step.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-0.5 flex-1 mb-3 rounded-full mx-1 ${step.done ? 'bg-orange-400' : 'bg-slate-200'}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Customer & Address */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</span>
                        <p className="text-base font-semibold text-slate-900">{task.order?.user?.name || '—'}</p>
                        <p className="text-sm text-slate-600 font-medium">{task.order?.user?.phone || '—'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Order Ref</span>
                        <p className="text-base font-semibold text-slate-900">#{task.order?.id}</p>
                        <p className="text-sm text-slate-600 font-medium capitalize">{task.order?.status?.replace(/_/g, ' ')}</p>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Dispatch Address</span>
                    <p className="text-base font-semibold text-slate-900">
                        {task.order?.address?.postcode || '—'}
                        {task.order?.address?.label ? ` — ${task.order.address.label}` : ''}
                    </p>
                    {task.order?.address?.directions && (
                        <p className="text-sm text-slate-700 font-medium bg-amber-50 border border-amber-200 rounded-xl p-2.5 italic">
                            📝 {task.order.address.directions}
                        </p>
                    )}

                    {/* Map deep-link */}
                    <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full rounded-xl bg-slate-100 border border-slate-200 hover:bg-orange-50 hover:border-orange-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-orange-700 transition-colors mt-1"
                    >
                        <svg className="h-4 w-4 text-orange-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Open in Maps
                        <svg className="h-3 w-3 ml-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Order Items */}
            {task.order?.items?.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Order Items</h3>
                    <div className="space-y-2">
                        {task.order.items.map((item, i) => {
                            const qty = parseFloat(item.qty || 1);
                            const unitPrice = parseFloat(item.unit_price || 0);
                            const lineTotal = parseFloat(item.line_total ?? (unitPrice * qty));

                            return (
                                <div key={i} className="flex items-center justify-between text-xs py-2.5 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-6 px-2 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 flex items-center justify-center text-xs font-black shrink-0">
                                            x{qty}
                                        </span>
                                        <div>
                                            <p className="font-bold text-slate-900">{item.service?.name}</p>
                                            {unitPrice > 0 && (
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                    {currencySymbol}{unitPrice.toFixed(2)} / unit
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-black text-slate-900 text-sm">
                                        {currencySymbol}{lineTotal.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100 mt-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>Subtotal</span>
                            <span>{currencySymbol}{parseFloat(task.order?.subtotal || 0).toFixed(2)}</span>
                        </div>
                        {parseFloat(task.order?.discount || 0) > 0 && (
                            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                                <span>Discount</span>
                                <span>-{currencySymbol}{parseFloat(task.order?.discount || 0).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>VAT</span>
                            <span>{currencySymbol}{parseFloat(task.order?.vat || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>Delivery Fee</span>
                            <span>{currencySymbol}{parseFloat(task.order?.delivery_fee || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-black pt-1.5 border-t border-slate-100 mt-1.5">
                            <span className="text-slate-700">Total</span>
                            <span className="text-slate-900 text-base">{currencySymbol}{parseFloat(task.order?.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ACTION PANELS ── */}

            {/* Completed state */}
            {isCompleted && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 text-center space-y-2">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                        <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-sm text-emerald-800">Task Completed</h3>
                    <p className="text-xs text-emerald-600 font-semibold">
                        {task.completed_at
                            ? `Logged at ${new Date(task.completed_at).toLocaleTimeString()}`
                            : 'Successfully logged'}
                    </p>
                </div>
            )}

            {/* Failed state */}
            {isFailed && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-6 text-center space-y-2">
                    <div className="h-14 w-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
                        <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <h3 className="font-extrabold text-sm text-rose-800">Task Failed</h3>
                    <p className="text-xs text-rose-600 font-semibold bg-rose-100 rounded-xl px-3 py-2 inline-block">
                        "{task.failure_reason}"
                    </p>
                </div>
            )}

            {/* Active task actions */}
            {!isCompleted && !isFailed && (
                <div className="space-y-4">

                    {/* 1. PICKUP FORM */}
                    {isPickup && (
                        <form onSubmit={handlePickup} noValidate className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                                Log Collection
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Item Count</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={pickupForm.data.item_count}
                                        onChange={e => pickupForm.setData('item_count', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-900 focus:outline-none transition-colors"
                                    />
                                    {pickupForm.errors.item_count && (
                                        <p className="text-xs text-red-600 font-bold">{pickupForm.errors.item_count}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Weight (KG)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Optional"
                                        value={pickupForm.data.weight}
                                        onChange={e => pickupForm.setData('weight', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-900 focus:outline-none transition-colors"
                                    />
                                    {pickupForm.errors.weight && (
                                        <p className="text-xs text-red-600 font-bold">{pickupForm.errors.weight}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                    Proof Photos (1–4 required)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    required
                                    onChange={handlePhotoChange}
                                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                {pickupForm.errors.photos && (
                                    <p className="text-xs text-red-600 font-bold">{pickupForm.errors.photos}</p>
                                )}
                                {pickupForm.errors['photos.0'] && (
                                    <p className="text-xs text-red-600 font-bold">Please select a valid image file.</p>
                                )}

                                {/* Photo previews */}
                                {photoPreviews.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {photoPreviews.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                alt={`Preview ${i + 1}`}
                                                className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={pickupForm.processing}
                                className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3.5 shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {pickupForm.processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Confirming...
                                    </>
                                ) : 'Confirm Collection & Tag Items'}
                            </button>
                        </form>
                    )}

                    {/* 2. DELIVERY PANELS */}
                    {!isPickup && (
                        <div className="space-y-4">
                            {/* Step 1 — start delivery */}
                            {isPending && (
                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Start Delivery Run
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        Tapping below will mark this delivery as en-route and send a 4-digit OTP to the customer via SMS to confirm handover.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleStartDelivery}
                                        className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-3.5 shadow-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Start Transit & Send OTP to Customer
                                    </button>
                                </div>
                            )}

                            {/* Step 2 — verify OTP + collect COD */}
                            {isEnRoute && (
                                <form onSubmit={handleDeliver} noValidate className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                            Confirm Customer Handover
                                        </h3>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                            Customer Handover OTP (4-digit)
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
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                                            } focus:bg-white focus:ring-2 rounded-xl py-3.5 px-3 text-xl font-black text-slate-900 tracking-[0.5em] text-center focus:outline-none transition-colors`}
                                        />
                                        {deliverForm.errors.otp && (
                                            <p className="text-xs text-red-600 font-bold text-center">{deliverForm.errors.otp}</p>
                                        )}
                                    </div>

                                    {/* COD section */}
                                    <div className="border-t border-slate-100 pt-4 space-y-3">
                                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Cash on Delivery</h4>
                                        <div className="flex items-center justify-between text-xs bg-orange-50 border border-orange-100 rounded-xl p-3">
                                            <span className="text-orange-800 font-bold">Invoice Total</span>
                                            <span className="text-orange-950 font-black text-base">
                                                {currencySymbol}{parseFloat(task.order?.total || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                                Cash Collected ({currencySymbol})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={deliverForm.data.cod_amount}
                                                onChange={e => deliverForm.setData('cod_amount', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-900 focus:outline-none transition-colors"
                                            />
                                            {deliverForm.errors.cod_amount && (
                                                <p className="text-xs text-red-600 font-bold">{deliverForm.errors.cod_amount}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={deliverForm.processing}
                                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {deliverForm.processing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Verify OTP & Complete Delivery
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Failure escape hatch */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => setShowFailPanel(!showFailPanel)}
                            className="w-full text-center text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors py-1 flex items-center justify-center gap-1.5"
                        >
                            {showFailPanel ? (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel failure report
                                </>
                            ) : (
                                <>
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    Report issue / unreachable address
                                </>
                            )}
                        </button>

                        {showFailPanel && (
                            <form onSubmit={handleFail} noValidate className="rounded-3xl border border-red-200 bg-red-50/20 p-5 space-y-3">
                                <h4 className="text-xs font-extrabold text-red-700 uppercase tracking-wider">Report Task Issue</h4>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Customer not home / No gate access / Wrong address"
                                        value={failForm.data.reason}
                                        onChange={e => failForm.setData('reason', e.target.value)}
                                        className="w-full bg-white border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none transition-colors"
                                    />
                                    {failForm.errors.reason && (
                                        <p className="text-[10px] text-red-600 font-bold">{failForm.errors.reason}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={failForm.processing}
                                    className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    {failForm.processing ? 'Submitting...' : 'Submit Failure Report'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

TaskShow.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
