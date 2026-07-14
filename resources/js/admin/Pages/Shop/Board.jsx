import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ShopLayout from '../../ShopLayout';

const STAGES = ['washing', 'drying', 'ironing', 'quality_check', 'ready'];
const STAGE_LABELS = { washing: 'Washing', drying: 'Drying', ironing: 'Ironing', quality_check: 'QC', ready: 'Packed' };

function ReceiveOrder({ order }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        counts: order.items.map((item) => ({ order_item_id: item.id, actual_qty: item.qty })),
    });

    function updateQty(index, value) {
        const counts = [...form.data.counts];
        counts[index] = { ...counts[index], actual_qty: value };
        form.setData('counts', counts);
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/shop/orders/${order.id}/receive`, { onSuccess: () => setOpen(false) });
    }

    return (
        <div className="rounded bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Order #{order.id} — {order.user?.name}</p>
                    <p className="text-xs text-slate-400">{order.address?.service_area?.name}</p>
                </div>
                <button onClick={() => setOpen(!open)} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
                    {open ? 'Cancel' : 'Receive'}
                </button>
            </div>
            {open && (
                <form onSubmit={submit} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    {order.items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.service?.name} (expected {item.qty})</span>
                            <input
                                type="number"
                                step="0.01"
                                value={form.data.counts[index].actual_qty}
                                onChange={(e) => updateQty(index, e.target.value)}
                                className="w-24 rounded border border-slate-300 px-2 py-1"
                            />
                        </div>
                    ))}
                    <button type="submit" className="mt-2 rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
                        Confirm receipt
                    </button>
                </form>
            )}
        </div>
    );
}

function IssueForm({ tag, onDone }) {
    const form = useForm({ note: '', photos: [] });

    function submit(e) {
        e.preventDefault();
        form.post(`/shop/garment-tags/${tag.id}/issue`, { forceFormData: true, onSuccess: onDone });
    }

    return (
        <form onSubmit={submit} className="mt-2 space-y-2 rounded border border-red-200 bg-red-50 p-3">
            <textarea
                value={form.data.note}
                onChange={(e) => form.setData('note', e.target.value)}
                placeholder="Describe the issue (damage, stain, missing...)"
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                rows={2}
            />
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => form.setData('photos', Array.from(e.target.files))}
                className="text-sm"
            />
            {form.errors.note && <p className="text-xs text-red-600">{form.errors.note}</p>}
            <button type="submit" className="rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                Flag issue — hold order
            </button>
        </form>
    );
}

function GarmentTagRow({ tag, orderStatus }) {
    const [showIssueForm, setShowIssueForm] = useState(false);

    function setStage(stage) {
        router.post(`/shop/garment-tags/${tag.id}/stage`, { stage }, { preserveScroll: true });
    }

    function resolve() {
        router.post(`/shop/garment-tags/${tag.id}/resolve`, {}, { preserveScroll: true });
    }

    return (
        <div className="rounded border border-slate-200 p-3">
            <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{tag.qr_code.slice(0, 8)}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{STAGE_LABELS[tag.stage] || tag.stage}</span>
            </div>

            {tag.issue_flag ? (
                <div className="mt-2 space-y-1">
                    <p className="text-xs text-red-600">{tag.issue_note}</p>
                    {tag.issue_photos?.length > 0 && (
                        <div className="flex gap-1">
                            {tag.issue_photos.map((url) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer">
                                    <img src={url} alt="Issue" className="h-12 w-12 rounded object-cover" />
                                </a>
                            ))}
                        </div>
                    )}
                    <button onClick={resolve} className="text-xs text-green-700 underline">Resolve issue</button>
                </div>
            ) : (
                orderStatus === 'processing' && (
                    <>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {STAGES.map((stage) => (
                                <button
                                    key={stage}
                                    onClick={() => setStage(stage)}
                                    className={`rounded px-2 py-1 text-xs ${
                                        tag.stage === stage ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {STAGE_LABELS[stage]}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowIssueForm(!showIssueForm)} className="mt-2 text-xs text-red-600 underline">
                            {showIssueForm ? 'Cancel' : 'Flag issue'}
                        </button>
                        {showIssueForm && <IssueForm tag={tag} onDone={() => setShowIssueForm(false)} />}
                    </>
                )
            )}
        </div>
    );
}

function FinalizeOrder({ order }) {
    const [open, setOpen] = useState(false);
    const kgItems = order.items.filter((i) => i.service?.unit === 'kg');
    const form = useForm({
        final_weight: order.final_weight || '',
        adjustments: kgItems.map((i) => ({ order_item_id: i.id, qty: i.qty })),
    });

    function updateAdjustment(index, value) {
        const adjustments = [...form.data.adjustments];
        adjustments[index] = { ...adjustments[index], qty: value };
        form.setData('adjustments', adjustments);
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/shop/orders/${order.id}/finalize`, { onSuccess: () => setOpen(false) });
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            <button onClick={() => setOpen(!open)} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">
                {open ? 'Cancel' : 'Confirm final weight & finish'}
            </button>
            {open && (
                <form onSubmit={submit} className="mt-3 space-y-2">
                    <div>
                        <label className="block text-xs font-medium mb-1">Final weight (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.final_weight}
                            onChange={(e) => form.setData('final_weight', e.target.value)}
                            className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                        />
                    </div>
                    {kgItems.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.service?.name} — actual qty (kg)</span>
                            <input
                                type="number"
                                step="0.01"
                                value={form.data.adjustments[index].qty}
                                onChange={(e) => updateAdjustment(index, e.target.value)}
                                className="w-24 rounded border border-slate-300 px-2 py-1"
                            />
                        </div>
                    ))}
                    {form.errors.final_weight && <p className="text-xs text-red-600">{form.errors.final_weight}</p>}
                    <button type="submit" className="rounded bg-green-700 px-3 py-1.5 text-sm text-white">
                        Generate invoice & mark ready
                    </button>
                </form>
            )}
        </div>
    );
}

function FloorOrder({ order }) {
    const tags = order.items.flatMap((item) => item.garment_tags.map((tag) => ({ ...tag, service: item.service?.name })));
    const allQualityChecked = tags.length > 0 && tags.every((t) => t.stage === 'quality_check');

    return (
        <div className="rounded bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Order #{order.id} — {order.user?.name}</p>
                    <p className="text-xs text-slate-400">
                        {order.address?.service_area?.name} · {order.status === 'on_hold' ? 'ON HOLD' : 'Processing'}
                    </p>
                </div>
                <a href={`/shop/orders/${order.id}/tags`} target="_blank" rel="noreferrer" className="text-sm text-slate-600 underline">
                    Print tags
                </a>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tags.map((tag) => (
                    <GarmentTagRow key={tag.id} tag={tag} orderStatus={order.status} />
                ))}
            </div>

            {order.status === 'processing' && allQualityChecked && <FinalizeOrder order={order} />}
        </div>
    );
}

export default function Board({ toReceive, onFloor }) {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <section>
                <h2 className="mb-3 text-lg font-semibold">To receive ({toReceive.data.length})</h2>
                <div className="space-y-3">
                    {toReceive.data.map((order) => (
                        <ReceiveOrder key={order.id} order={order} />
                    ))}
                    {toReceive.data.length === 0 && <p className="text-sm text-slate-400">Nothing waiting for intake.</p>}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-lg font-semibold">On the floor ({onFloor.data.length})</h2>
                <div className="space-y-3">
                    {onFloor.data.map((order) => (
                        <FloorOrder key={order.id} order={order} />
                    ))}
                    {onFloor.data.length === 0 && <p className="text-sm text-slate-400">Nothing being processed right now.</p>}
                </div>
            </section>
        </div>
    );
}

Board.layout = (page) => <ShopLayout children={page} />;
