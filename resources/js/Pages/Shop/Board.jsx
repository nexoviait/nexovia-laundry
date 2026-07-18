import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ShopLayout from '@/Layouts/ShopLayout';

const STAGES = ['washing', 'drying', 'ironing', 'quality_check', 'ready'];
const STAGE_LABELS = { 
    washing: 'Washing', 
    drying: 'Drying', 
    ironing: 'Ironing', 
    quality_check: 'QC Pass', 
    ready: 'Ready Pack' 
};

const STAGE_ICONS = {
    washing: '🧼',
    drying: '💨',
    ironing: '🔌',
    quality_check: '✨',
    ready: '📦'
};

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
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-350 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-extrabold text-sm">
                        📥
                    </span>
                    <div>
                        <p className="font-extrabold text-slate-800 text-sm">Order #CL-{order.id} — {order.user?.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{order.address?.service_area?.name || 'Standard Zone'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setOpen(!open)} 
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-extrabold text-white transition-colors"
                >
                    {open ? 'Cancel' : 'Receive Laundry'}
                </button>
            </div>
            
            {open && (
                <form onSubmit={submit} className="mt-3 space-y-3.5 border-t border-slate-100 pt-3.5 animate-slide-down">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Intake Verification checklist</p>
                    {order.items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>{item.service?.name} (expected {item.qty})</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.data.counts[index].actual_qty}
                                    onChange={(e) => updateQty(index, e.target.value)}
                                    className="w-24 bg-slate-50 border border-slate-250 focus:bg-white focus:border-blue-500 rounded-xl py-1.5 px-3 text-xs font-extrabold text-slate-850 focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-semibold capitalize">{item.service?.unit || 'item'}</span>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm">
                            Confirm receipt & Tag
                        </button>
                    </div>
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
        <form onSubmit={submit} className="mt-3.5 space-y-3.5 rounded-2xl border border-rose-250 bg-rose-50/20 p-4 animate-slide-down">
            <h4 className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Flag Garment Issue</h4>
            <textarea
                value={form.data.note}
                onChange={(e) => form.setData('note', e.target.value)}
                placeholder="Describe garment stain, damage, or mismatch item instructions..."
                className="w-full bg-white border border-slate-200 focus:border-red-500 rounded-xl p-3 text-xs font-semibold focus:outline-none"
                rows={2}
                required
            />
            <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Attach Photo Proof</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => form.setData('photos', Array.from(e.target.files))}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-extrabold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                />
            </div>
            {form.errors.note && <p className="text-xs text-red-650 font-bold">{form.errors.note}</p>}
            <button type="submit" className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2 text-xs font-extrabold text-white shadow-sm">
                Flag Issue & Hold Order
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

    const currentStageIndex = STAGES.indexOf(tag.stage);

    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            
            {/* Tag details */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider bg-slate-200/50 px-1.5 py-0.5 rounded">
                        🏷️ {tag.qr_code.slice(0, 8)}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-extrabold mt-1">{tag.service}</span>
                </div>
                
                <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600">
                    {STAGE_LABELS[tag.stage] || tag.stage}
                </span>
            </div>

            {/* Hold issue logs */}
            {tag.issue_flag ? (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3.5 space-y-2.5">
                    <div className="flex items-start gap-1">
                        <span className="text-sm">⚠️</span>
                        <div className="text-xs text-rose-800 font-bold leading-normal">
                            {tag.issue_note}
                        </div>
                    </div>
                    {tag.issue_photos?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {tag.issue_photos.map((url) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer">
                                    <img src={url} alt="Issue photo" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                                </a>
                            ))}
                        </div>
                    )}
                    <button 
                        onClick={resolve} 
                        className="text-xs font-black text-emerald-700 hover:text-emerald-800 underline block"
                    >
                        Resolve Issue & Resume
                    </button>
                </div>
            ) : (
                orderStatus === 'processing' && (
                    <div className="space-y-3.5">
                        
                        {/* Progress Stepper buttons */}
                        <div className="flex items-center justify-between gap-1 border-t border-slate-100/60 pt-3">
                            {STAGES.map((stage, idx) => {
                                const isCurrent = tag.stage === stage;
                                const isDone = currentStageIndex > STAGES.indexOf(stage);
                                
                                return (
                                    <button
                                        key={stage}
                                        onClick={() => setStage(stage)}
                                        disabled={STAGES.indexOf(stage) < currentStageIndex}
                                        title={STAGE_LABELS[stage]}
                                        className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs transition-colors shrink-0 ${
                                            isCurrent 
                                                ? 'bg-slate-900 text-white font-black' 
                                                : isDone 
                                                ? 'bg-emerald-50 text-emerald-700' 
                                                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-400'
                                        } disabled:opacity-50`}
                                    >
                                        <span>{STAGE_ICONS[stage]}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100/60 pt-2 text-[10px] font-bold">
                            <span className="text-slate-400">Progression Stepper</span>
                            <button 
                                onClick={() => setShowIssueForm(!showIssueForm)} 
                                className="text-rose-600 hover:text-rose-700 underline"
                            >
                                {showIssueForm ? 'Cancel' : '⚠️ Flag Issue'}
                            </button>
                        </div>

                        {showIssueForm && <IssueForm tag={tag} onDone={() => setShowIssueForm(false)} />}
                    </div>
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
        <div className="border-t border-slate-100 pt-4 mt-1">
            <button 
                onClick={() => setOpen(!open)} 
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 shadow-sm shadow-blue-100 transition-colors"
            >
                {open ? '✕ Cancel Finalization' : '✨ Confirm Final Weight & Pack Order'}
            </button>
            
            {open && (
                <form onSubmit={submit} className="mt-4 space-y-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 animate-slide-down">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Scale Weights & Pack Audit</h4>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Scale Weight (KG)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.data.final_weight}
                                onChange={(e) => form.setData('final_weight', e.target.value)}
                                className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                            />
                        </div>

                        {kgItems.map((item, index) => (
                            <div key={item.id} className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-550 uppercase block">{item.service?.name} actual qty (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.data.adjustments[index].qty}
                                    onChange={(e) => updateAdjustment(index, e.target.value)}
                                    className="w-full bg-white border border-slate-250 focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    {form.errors.final_weight && <p className="text-xs text-red-600 font-bold">{form.errors.final_weight}</p>}
                    
                    <button 
                        type="submit" 
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm"
                    >
                        Generate Invoice & Dispatch to "Ready"
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-slate-350 transition-all">
            <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Order #CL-{order.id} — {order.user?.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        📍 {order.address?.service_area?.name || 'Area'} · <span className={`uppercase font-extrabold text-[10px] ${
                            order.status === 'on_hold' ? 'text-rose-600' : 'text-blue-600'
                        }`}>{order.status === 'on_hold' ? '⚠️ ON HOLD (Issue)' : '⚙️ Processing'}</span>
                    </p>
                </div>
                
                <a 
                    href={`/shop/orders/${order.id}/tags`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs px-3.5 py-1.5 transition-colors"
                >
                    Print Tags 🖨️
                </a>
            </div>

            {/* Garments tags progression list */}
            <div className="grid gap-4 sm:grid-cols-2 pt-1">
                {tags.map((tag) => (
                    <GarmentTagRow key={tag.id} tag={tag} orderStatus={order.status} />
                ))}
            </div>

            {order.status === 'processing' && allQualityChecked && (
                <div className="bg-blue-50/30 border border-dashed border-blue-200 rounded-3xl p-5 space-y-3.5 mt-2 animate-pulse-subtle">
                    <div>
                        <h4 className="text-xs font-extrabold text-blue-900 uppercase">Quality Check Passed</h4>
                        <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                            All garment tags have successfully cleared the QA stage. Complete packing audit below.
                        </p>
                    </div>
                    <FinalizeOrder order={order} />
                </div>
            )}
        </div>
    );
}

export default function Board({ toReceive, onFloor }) {
    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
            
            {/* Header section */}
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shop Floor Management</h1>
                <p className="mt-1 text-slate-500 text-sm font-semibold">
                    Accept collections, tag garments, update washing/drying stages, verify QA passes, and finalize invoices.
                </p>
            </div>

            {/* Intake list queue */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-450 uppercase tracking-wider">Awaiting Intake ({toReceive.data.length})</h2>
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                    {toReceive.data.map((order) => (
                        <ReceiveOrder key={order.id} order={order} />
                    ))}
                </div>
                {toReceive.data.length === 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 font-semibold text-xs">
                        No orders awaiting intake collection receipt.
                    </div>
                )}
            </section>

            {/* Floor processing list queue */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-450 uppercase tracking-wider">Processing Floor Queue ({onFloor.data.length})</h2>
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
                
                <div className="space-y-5">
                    {onFloor.data.map((order) => (
                        <FloorOrder key={order.id} order={order} />
                    ))}
                    {onFloor.data.length === 0 && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 font-semibold text-xs">
                            No orders active on the laundry floor.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

Board.layout = (page) => <ShopLayout children={page} />;
