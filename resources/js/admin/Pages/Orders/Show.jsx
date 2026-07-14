import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Layout';

function Section({ title, children }) {
    return (
        <div className="rounded bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
            {children}
        </div>
    );
}

export default function Show({ order, drivers, timeSlots }) {
    const [slotId, setSlotId] = useState(order.time_slot?.id ?? '');
    const [driverId, setDriverId] = useState('');
    const [showCancel, setShowCancel] = useState(false);
    const [showAdjust, setShowAdjust] = useState(false);

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

    const canCancel = !['delivered', 'cancelled', 'rated'].includes(order.status);
    const canConfirm = order.status === 'pending';
    const canAssign = order.status === 'confirmed';

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">{order.status}</span>
            </div>

            <Section title="Customer & address">
                <p className="font-medium">{order.user?.name}</p>
                <p className="text-sm text-slate-500">{order.user?.phone}</p>
                <p className="mt-2 text-sm">
                    {order.address?.label} — {order.address?.postcode} ({order.address?.service_area?.name})
                </p>
                {order.address?.directions && <p className="text-sm text-slate-500">{order.address.directions}</p>}
                {order.note && <p className="mt-2 text-sm italic text-slate-500">Customer note: {order.note}</p>}
            </Section>

            <Section title="Items">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-400">
                        <tr>
                            <th className="py-1">Service</th>
                            <th className="py-1">Qty</th>
                            <th className="py-1">Unit price</th>
                            <th className="py-1">Line total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item) => (
                            <tr key={item.id} className="border-t border-slate-100">
                                <td className="py-2">{item.service?.name}</td>
                                <td className="py-2">{item.qty}</td>
                                <td className="py-2">£{item.unit_price}</td>
                                <td className="py-2">£{item.line_total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <div>Subtotal: £{order.subtotal}</div>
                    <div>Discount: £{order.discount}</div>
                    <div>Delivery fee: £{order.delivery_fee}</div>
                    <div>VAT: £{order.vat}</div>
                    <div className="font-semibold text-slate-900">Total: £{order.total}</div>
                </div>
                <button onClick={() => setShowAdjust(!showAdjust)} className="mt-3 text-sm text-slate-600 underline">
                    {showAdjust ? 'Cancel adjustment' : 'Adjust discount'}
                </button>
                {showAdjust && (
                    <form onSubmit={submitAdjust} className="mt-3 space-y-2 rounded border border-slate-200 p-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">New discount (£)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={adjustForm.data.discount}
                                onChange={(e) => adjustForm.setData('discount', e.target.value)}
                                className="w-40 rounded border border-slate-300 px-2 py-1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Reason</label>
                            <input
                                value={adjustForm.data.reason}
                                onChange={(e) => adjustForm.setData('reason', e.target.value)}
                                className="w-full rounded border border-slate-300 px-2 py-1"
                            />
                            {adjustForm.errors.reason && <p className="text-xs text-red-600">{adjustForm.errors.reason}</p>}
                        </div>
                        <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
                            Save adjustment
                        </button>
                    </form>
                )}
            </Section>

            <Section title="Pickup & fulfilment">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-medium mb-1">Pickup slot</label>
                        <select
                            value={slotId}
                            onChange={(e) => setSlotId(e.target.value)}
                            className="rounded border border-slate-300 px-3 py-2 text-sm"
                        >
                            <option value="">Select a slot</option>
                            {timeSlots.map((s) => (
                                <option key={s.id} value={s.id}>{s.date} {s.window}</option>
                            ))}
                        </select>
                    </div>

                    {canConfirm && (
                        <button onClick={confirmOrder} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                            Confirm order
                        </button>
                    )}
                    {!canConfirm && (
                        <button onClick={changeSlot} className="rounded border border-slate-300 px-3 py-2 text-sm">
                            Change pickup time
                        </button>
                    )}
                </div>

                {canAssign && (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Assign driver</label>
                            <select
                                value={driverId}
                                onChange={(e) => setDriverId(e.target.value)}
                                className="rounded border border-slate-300 px-3 py-2 text-sm"
                            >
                                <option value="">Select a driver</option>
                                {drivers.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={assignDriver} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                            Assign
                        </button>
                    </div>
                )}

                {order.driver_tasks?.length > 0 && (
                    <div className="mt-4 space-y-1 text-sm">
                        {order.driver_tasks.map((t) => (
                            <div key={t.id}>
                                {t.type} — {t.driver?.user?.name ?? 'Unassigned'} ({t.status})
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            <Section title="Status timeline">
                <ol className="space-y-2 text-sm">
                    {order.status_histories?.map((h) => (
                        <li key={h.id} className="border-l-2 border-slate-200 pl-3">
                            <span className="font-medium">{h.status}</span>
                            <span className="ml-2 text-slate-400">{h.created_at}</span>
                            {h.changed_by?.name && <span className="ml-2 text-slate-400">by {h.changed_by.name}</span>}
                            {h.note && <div className="text-slate-500">{h.note}</div>}
                        </li>
                    ))}
                </ol>
            </Section>

            <Section title="Notes">
                <form onSubmit={submitNote} className="mb-4 space-y-2">
                    <textarea
                        value={noteForm.data.note}
                        onChange={(e) => noteForm.setData('note', e.target.value)}
                        placeholder="Add a note…"
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        rows={2}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={noteForm.data.visible_to_customer}
                            onChange={(e) => noteForm.setData('visible_to_customer', e.target.checked)}
                        />
                        Visible to customer
                    </label>
                    <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
                        Add note
                    </button>
                </form>
                <ul className="space-y-2 text-sm">
                    {order.notes?.map((n) => (
                        <li key={n.id} className="border-t border-slate-100 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{n.user?.name ?? 'System'}</span>
                                <span className="text-slate-400">{n.created_at}</span>
                                {n.visible_to_customer && (
                                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                                        Customer-visible
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600">{n.note}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            {canCancel && (
                <Section title="Cancel order">
                    <button onClick={() => setShowCancel(!showCancel)} className="text-sm text-red-600 underline">
                        {showCancel ? 'Never mind' : 'Cancel this order'}
                    </button>
                    {showCancel && (
                        <form onSubmit={submitCancel} className="mt-3 space-y-2">
                            <input
                                value={cancelForm.data.reason}
                                onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                placeholder="Reason for cancellation"
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            />
                            {cancelForm.errors.reason && <p className="text-xs text-red-600">{cancelForm.errors.reason}</p>}
                            <button type="submit" className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                                Confirm cancellation
                            </button>
                        </form>
                    )}
                </Section>
            )}
        </div>
    );
}

Show.layout = (page) => <Layout children={page} />;
