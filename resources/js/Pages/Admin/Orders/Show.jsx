import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

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

export default function Show({ order, drivers, timeSlots }) {
    const { props: pageProps } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[pageProps.settings?.currency || 'GBP'] || '£';

    const [slotId, setSlotId] = useState(order.time_slot?.id ?? '');
    const [driverId, setDriverId] = useState('');
    const [showCancel, setShowCancel] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);
    const [statusToTransition, setStatusToTransition] = useState(order.status || 'pending');
    const [transitionNote, setTransitionNote] = useState('');

    const noteForm = useForm({ note: '', visible_to_customer: false });
    const cancelForm = useForm({ reason: '' });
    const adjustForm = useForm({ discount: order.discount ?? 0, reason: '' });

    function confirmOrder() {
        router.post(`/admin/orders/${order.id}/confirm`, { time_slot_id: slotId || null });
    }

    function changeSlot() {
        router.post(`/admin/orders/${order.id}/time-slot`, { time_slot_id: slotId });
    }

    function assignDriver() {
        if (!driverId) return;
        router.post(`/admin/orders/${order.id}/assign-driver`, { driver_id: driverId });
    }

    function submitNote(e) {
        e.preventDefault();
        noteForm.post(`/admin/orders/${order.id}/notes`, { onSuccess: () => noteForm.reset() });
    }

    function submitCancel(e) {
        e.preventDefault();
        cancelForm.post(`/admin/orders/${order.id}/cancel`, { onSuccess: () => setShowCancel(false) });
    }

    function submitAdjust(e) {
        e.preventDefault();
        adjustForm.post(`/admin/orders/${order.id}/adjust`, { onSuccess: () => setShowAdjust(false) });
    }

    function submitTransition() {
        router.post(`/admin/orders/${order.id}/transition`, {
            status: statusToTransition,
            note: transitionNote || undefined
        }, {
            onSuccess: () => {
                setTransitionNote('');
            }
        });
    }

    const canCancel = !['delivered', 'cancelled', 'rated'].includes(order.status);
    const canConfirm = order.status === 'pending';
    const canAssign = order.status === 'confirmed';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Order #CL-{order.id}</span>
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_THEMES[order.status] || 'bg-slate-100'}`}>
                            {STATUS_LABELS[order.status] || order.status}
                        </span>
                    </div>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Placed by <span className="text-slate-700 font-bold">{order.user?.name}</span> on {new Date(order.created_at || Date.now()).toLocaleDateString()}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-3.5 py-2 transition-colors flex items-center gap-1.5"
                    >
                        <span>🖨️</span> Print Invoice
                    </button>
                </div>
            </div>

            {/* Split layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Main details panel (2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Customer & Address Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Customer & Delivery Profile</h3>
                            <span className="text-xs font-bold text-orange-600">ID: {order.user?.id}</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center text-sm font-black shrink-0">
                                👤
                            </span>
                            <div className="space-y-1.5">
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight">{order.user?.name}</h4>
                                <p className="text-xs text-slate-500 font-semibold">{order.user?.phone} • {order.user?.email}</p>
                                <p className="text-xs text-slate-700 font-bold">
                                    📍 {order.address?.label} — {order.address?.postcode} ({order.address?.service_area?.name || 'In Area'})
                                </p>
                                {order.address?.directions && (
                                    <p className="text-[11px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 rounded-xl p-2.5 italic">
                                        Directions: {order.address.directions}
                                    </p>
                                )}
                                {order.note && (
                                    <p className="text-[11px] text-orange-600 font-semibold bg-orange-50/50 border border-orange-100 rounded-xl p-2.5">
                                        Customer instructions: {order.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fulfilment modifier actions (e.g. status transition, pickup timeslot, driver) */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Order Fulfilment Modifiers</h3>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            
                            {/* Time Slot settings */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Pickup / Dispatch Slot</h4>
                                <div className="space-y-2">
                                    <select
                                        value={slotId}
                                        onChange={(e) => setSlotId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
                                    >
                                        <option value="">Select slot</option>
                                        {timeSlots.map((s) => (
                                            <option key={s.id} value={s.id}>{s.date} • {s.window}</option>
                                        ))}
                                    </select>
                                    
                                    {canConfirm ? (
                                        <button
                                            type="button"
                                            onClick={confirmOrder}
                                            className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-2 shadow-sm"
                                        >
                                            Confirm Order
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={changeSlot}
                                            className="w-full rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-2"
                                        >
                                            Update Slot
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Driver Assign settings */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Assign Driver</h4>
                                <div className="space-y-2">
                                    <select
                                        value={driverId}
                                        onChange={(e) => setDriverId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
                                    >
                                        <option value="">Select driver</option>
                                        {drivers.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    
                                    <button
                                        type="button"
                                        onClick={assignDriver}
                                        disabled={!driverId}
                                        className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs py-2 shadow-sm disabled:opacity-50"
                                    >
                                        Assign Driver Leg
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order status manual transition panel */}
                        <div className="border-t border-slate-100 pt-5 space-y-3">
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Manual Pipeline Transition</h4>
                            <div className="grid gap-3 sm:grid-cols-3 items-end">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Target State</label>
                                    <select
                                        value={statusToTransition}
                                        onChange={(e) => setStatusToTransition(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none"
                                    >
                                        <option value="pending">Awaiting Pickup (pending)</option>
                                        <option value="confirmed">Confirmed (confirmed)</option>
                                        <option value="assigned">Assigned (assigned)</option>
                                        <option value="picked_up">Picked up (picked_up)</option>
                                        <option value="processing">Processing (processing)</option>
                                        <option value="on_hold">Issue Flag (on_hold)</option>
                                        <option value="ready">Ready (ready)</option>
                                        <option value="out_for_delivery">Out for Delivery (out_for_delivery)</option>
                                        <option value="delivered">Delivered (delivered)</option>
                                        <option value="cancelled">Cancelled (cancelled)</option>
                                        <option value="rated">Rated (rated)</option>
                                    </select>
                                </div>

                                <div className="space-y-1 sm:col-span-2 flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Note / Reason</label>
                                        <input
                                            type="text"
                                            value={transitionNote}
                                            onChange={(e) => setTransitionNote(e.target.value)}
                                            placeholder="Optional explanation for transition log"
                                            className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={submitTransition}
                                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2"
                                    >
                                        Transition
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items table */}
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 space-y-5">
                        <div>
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Garments Order Items</h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Itemized booking manifest</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                        <th className="pb-2.5 pr-4">Service</th>
                                        <th className="pb-2.5 px-4">Pricing Unit</th>
                                        <th className="pb-2.5 px-4 text-center">Qty / Vol</th>
                                        <th className="pb-2.5 px-4 text-right">Unit Price</th>
                                        <th className="pb-2.5 pl-4 text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/30">
                                            <td className="py-3.5 pr-4">
                                                <div className="font-bold text-slate-900 text-sm">{item.service?.name}</div>
                                                {item.garment_tags && item.garment_tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.garment_tags.map(tag => (
                                                            <span key={tag.id} className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold font-mono text-slate-500 uppercase">
                                                                🏷️ {tag.qr_code} • {tag.stage}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-xs font-bold text-slate-450 uppercase">{item.service?.unit || 'item'}</td>
                                            <td className="py-3.5 px-4 text-center">{item.qty}</td>
                                            <td className="py-3.5 px-4 text-right">{currencySymbol}{parseFloat(item.unit_price).toFixed(2)}</td>
                                            <td className="py-3.5 pl-4 text-right text-slate-900 font-bold">{currencySymbol}{parseFloat(item.line_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Invoice & Totals calculations */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowAdjust(!showAdjust)}
                                    className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                                >
                                    <span>⚙️</span> {showAdjust ? 'Collapse adjustment panel' : 'Modify discount override'}
                                </button>
                                
                                {showAdjust && (
                                    <form onSubmit={submitAdjust} className="mt-3.5 space-y-3 rounded-2xl border border-slate-250 bg-slate-50/50 p-4 max-w-sm">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Discount ({currencySymbol})</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={adjustForm.data.discount}
                                                onChange={(e) => adjustForm.setData('discount', e.target.value)}
                                                className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Adjustment Reason</label>
                                            <input
                                                type="text"
                                                required
                                                value={adjustForm.data.reason}
                                                onChange={(e) => adjustForm.setData('reason', e.target.value)}
                                                placeholder="e.g. Customer loyalty concession"
                                                className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl py-2 px-3.5 text-xs font-semibold focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={adjustForm.processing}
                                            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 shadow-sm disabled:opacity-50"
                                        >
                                            Save Adjustment
                                        </button>
                                    </form>
                                )}
                            </div>

                            <div className="w-64 space-y-2 text-xs font-semibold text-slate-500">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="text-slate-800">{currencySymbol}{parseFloat(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>Discount Override:</span>
                                    <span>-{currencySymbol}{parseFloat(order.discount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Charge:</span>
                                    <span className="text-slate-800">{currencySymbol}{parseFloat(order.delivery_fee || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>VAT Rate (20%):</span>
                                    <span className="text-slate-800">{currencySymbol}{parseFloat(order.vat || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                                    <span>Grand Total:</span>
                                    <span>{currencySymbol}{parseFloat(order.total).toFixed(2)}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Sidebar details panel (1 column) */}
                <div className="space-y-6">
                    
                    {/* Invoice & Payments Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Invoice & Payments</h3>
                            <span className="text-lg">💳</span>
                        </div>

                        {order.invoice ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 uppercase font-mono">INV REF:</span>
                                    <span className="text-slate-800 font-extrabold">#INV-{order.invoice.id}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 uppercase">Status:</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                        order.invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                        {order.invoice.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-400 uppercase">Issued:</span>
                                    <span className="text-slate-700">{new Date(order.invoice.issued_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold border-t border-slate-50 pt-2 text-slate-900">
                                    <span>Invoiced Total:</span>
                                    <span className="text-sm font-black">{currencySymbol}{parseFloat(order.invoice.total).toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 text-center">
                                <p className="text-[11px] text-amber-700 font-extrabold leading-normal">
                                    ⚠️ Invoice has not been generated yet. Invoice will auto-generate once the order is finalized to "Ready".
                                </p>
                            </div>
                        )}
                    </div>

                    {/* QR Code Pass Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Order QR Scan Pass</h3>
                            <span className="text-lg">📱</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 border border-slate-100 bg-slate-50 rounded-2xl">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=order-${order.id}`}
                                alt={`Order ${order.id} QR Code`}
                                className="h-32 w-32 bg-white p-2 rounded-xl shadow-sm border border-slate-200"
                            />
                            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest font-mono mt-3">
                                SCAN CODE: CL-{order.id}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold text-center leading-normal">
                            Scannable QR Pass for drivers during pickup confirmation, and shop staff during receipt scans.
                        </p>
                    </div>

                    {/* Status histories visual timeline */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Fulfilment Timeline</h3>
                        </div>

                        <ol className="relative border-l border-slate-200 space-y-5 ml-1">
                            {order.status_histories?.map((h, i) => (
                                <li key={h.id} className="relative pl-6">
                                    {/* Timeline bullet dot */}
                                    <span className="absolute -left-1.5 top-1.5 h-3.5 w-3.5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                                    </span>
                                    
                                    <div className="space-y-0.5">
                                        <div className="flex items-center justify-between gap-1 text-[11px] font-extrabold text-slate-900 uppercase">
                                            <span>{STATUS_LABELS[h.status] || h.status}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold lowercase">
                                                {new Date(h.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-semibold">
                                            {h.changed_by?.name ? `by ${h.changed_by.name}` : 'System Agent'}
                                        </div>
                                        {h.note && (
                                            <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-1.5 mt-1 font-medium leading-normal italic">
                                                "{h.note}"
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Internal Notes log */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Internal Notes</h3>
                        </div>

                        <form onSubmit={submitNote} className="space-y-3">
                            <textarea
                                value={noteForm.data.note}
                                onChange={(e) => noteForm.setData('note', e.target.value)}
                                placeholder="Add internal log note…"
                                className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:border-blue-500 rounded-xl p-3 text-xs font-semibold focus:outline-none"
                                rows={2}
                            />
                            
                            <div className="flex items-center justify-between gap-2">
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                    <input
                                        type="checkbox"
                                        checked={noteForm.data.visible_to_customer}
                                        onChange={(e) => noteForm.setData('visible_to_customer', e.target.checked)}
                                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    Visible to customer
                                </label>
                                
                                <button
                                    type="submit"
                                    disabled={noteForm.processing || !noteForm.data.note}
                                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-1.5 shadow-sm disabled:opacity-50"
                                >
                                    Log Note
                                </button>
                            </div>
                        </form>

                        <div className="divide-y divide-slate-50 space-y-3 pt-2">
                            {order.notes?.map((n) => (
                                <div key={n.id} className="pt-3 space-y-1 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-slate-850">{n.user?.name ?? 'System'}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">
                                            {new Date(n.created_at || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 font-medium">{n.note}</p>
                                    {n.visible_to_customer && (
                                        <span className="inline-flex rounded bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                            Visible to Customer
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cancel Action */}
                    {canCancel && (
                        <div className="rounded-3xl border border-red-200 bg-red-50/20 p-6 shadow-sm space-y-4">
                            <button
                                type="button"
                                onClick={() => setShowCancel(!showCancel)}
                                className="w-full text-center text-xs font-black text-red-600 hover:underline"
                            >
                                {showCancel ? '✕ Close Cancellation form' : '⚠️ Cancel Order'}
                            </button>
                            
                            {showCancel && (
                                <form onSubmit={submitCancel} className="space-y-3 pt-2">
                                    <input
                                        value={cancelForm.data.reason}
                                        onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                        placeholder="Reason for cancellation"
                                        required
                                        className="w-full bg-white border border-red-200 focus:border-red-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                                    />
                                    
                                    <button
                                        type="submit"
                                        disabled={cancelForm.processing}
                                        className="w-full rounded-xl bg-red-650 hover:bg-red-700 text-white font-extrabold text-xs py-2 shadow-sm"
                                    >
                                        Confirm Cancellation
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                </div>

            </div>

            {/* Standard Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] font-bold text-slate-400 pt-6 border-t border-slate-100">
                <span>Clean Laundry System © 2026. All Rights Reserved.</span>
                <div className="flex gap-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">API Documentation</a>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page) => <Layout children={page} />;
