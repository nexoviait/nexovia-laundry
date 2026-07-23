import { router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import ShopLayout from '@/Layouts/ShopLayout';

const STAGES = ['washing', 'drying', 'ironing', 'quality_check', 'ready'];

const STAGE_CONFIG = {
    washing: { label: 'To Wash', icon: '🧼', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    drying: { label: 'Drying', icon: '💨', color: 'bg-[#fe7300]/10 text-[#f95700] border-[#fe7300]/20' },
    ironing: { label: 'Ironing', icon: '🔌', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    quality_check: { label: 'Quality Check', icon: '✨', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    ready: { label: 'Ready for Bagging', icon: '📦', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};

const GARMENT_IMAGES = {
    shirt: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
    suit: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
    trousers: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80',
    bedsheet: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80',
    jacket: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
    default: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=400&q=80'
};

function getGarmentImage(serviceName = '') {
    const s = serviceName.toLowerCase();
    if (s.includes('suit') || s.includes('jacket')) return GARMENT_IMAGES.suit;
    if (s.includes('shirt')) return GARMENT_IMAGES.shirt;
    if (s.includes('trouser') || s.includes('pant')) return GARMENT_IMAGES.trousers;
    if (s.includes('bed') || s.includes('linen') || s.includes('sheet')) return GARMENT_IMAGES.bedsheet;
    return GARMENT_IMAGES.default;
}

// Receive Order Card in Intake List View
function ReceiveOrderCard({ order }) {
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

    const orderNum = order.id;
    const customerName = order.user?.name || 'Customer';
    const areaName = (order.address?.service_area?.name || 'LOZELLS').toUpperCase();

    return (
        <div className="rounded-3xl border border-orange-200/80 bg-white p-5 shadow-2xs hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between gap-3">
                {/* Left Soft Icon Badge */}
                <div className="h-12 w-12 rounded-2xl bg-orange-50/80 border border-orange-100/80 flex items-center justify-center text-[#f95700] shrink-0">
                    <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>

                {/* Center Details with Vertical Divider */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div>
                        <div className="text-xs font-black text-slate-800 leading-tight">#CL-</div>
                        <div className="text-base font-black text-slate-900 leading-none">{orderNum}</div>
                    </div>

                    <span className="h-7 w-px bg-slate-200 shrink-0"></span>

                    <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">{customerName}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{areaName}</div>
                    </div>
                </div>

                {/* Right Action Button */}
                <button
                    onClick={() => setOpen(!open)}
                    className="rounded-2xl bg-[#f95700] hover:bg-[#e04f00] px-5 py-2.5 text-xs font-black text-white shadow-sm shadow-orange-500/20 transition-all cursor-pointer shrink-0"
                >
                    {open ? 'Cancel' : 'Receive'}
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
                                    className="w-24 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-1.5 px-3 text-xs font-extrabold text-slate-800 focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-semibold capitalize">{item.service?.unit || 'item'}</span>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="rounded-xl bg-[#f95700] hover:bg-[#e04f00] px-4 py-2 text-xs font-extrabold text-white shadow-sm cursor-pointer transition-colors">
                            Confirm Receipt & Tag Garments
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function FinalizeOrder({ order }) {
    const [open, setOpen] = useState(false);
    const kgItems = order.items.filter((item) => item.service?.unit === 'kg');
    const form = useForm({
        final_weight: order.final_weight || '',
        adjustments: kgItems.map((item) => ({ order_item_id: item.id, qty: item.qty })),
    });

    function updateAdjustment(index, value) {
        const adj = [...form.data.adjustments];
        adj[index] = { ...adj[index], qty: value };
        form.setData('adjustments', adj);
    }

    function submit(e) {
        e.preventDefault();
        form.post(`/shop/orders/${order.id}/finalize`, { onSuccess: () => setOpen(false) });
    }

    return (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>✨</span> Order #CL-{order.id} Ready for Packing
                    </h4>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        All garments for {order.user?.name} have passed Quality Check. Complete final scale weight audit below.
                    </p>
                </div>
                <button 
                    onClick={() => setOpen(!open)} 
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 shadow-sm transition-colors cursor-pointer"
                >
                    {open ? 'Cancel' : 'Confirm Final Weight & Pack'}
                </button>
            </div>
            
            {open && (
                <form onSubmit={submit} noValidate className="mt-4 space-y-4 rounded-2xl bg-white border border-emerald-200 p-4 animate-slide-down">
                    <h4 className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Scale Weights & Pack Audit</h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Scale Weight (KG)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.data.final_weight}
                                onChange={(e) => form.setData('final_weight', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                            />
                            {form.errors.final_weight && <p className="text-xs text-rose-600 font-bold mt-1">{form.errors.final_weight}</p>}
                        </div>

                        {kgItems.map((item, index) => (
                            <div key={item.id} className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block">{item.service?.name} actual qty (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={form.data.adjustments[index].qty}
                                    onChange={(e) => updateAdjustment(index, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                                />
                                {form.errors[`adjustments.${index}.qty`] && <p className="text-xs text-rose-600 font-bold mt-1">{form.errors[`adjustments.${index}.qty`]}</p>}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit" 
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm cursor-pointer"
                    >
                        Generate Invoice & Dispatch to "Ready"
                    </button>
                </form>
            )}
        </div>
    );
}

// Order Inspection & Garment Tags Drawer Modal
function OrderDetailDrawer({ orderCard, onClose }) {
    if (!orderCard) return null;

    const [showIssue, setShowIssue] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState(orderCard.tags[0]?.id || null);
    const form = useForm({ note: '', photos: [] });

    const currentStageIndex = STAGES.indexOf(orderCard.stage);
    const nextStage = STAGES[currentStageIndex + 1];

    function advanceOrder() {
        if (!nextStage) return;
        router.post(`/shop/orders/${orderCard.id}/advance-all-stages`, { stage: nextStage }, {
            preserveScroll: true,
            onSuccess: () => onClose()
        });
    }

    function submitIssue(e) {
        e.preventDefault();
        if (!selectedTagId) return;
        form.post(`/shop/garment-tags/${selectedTagId}/issue`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowIssue(false);
                onClose();
            }
        });
    }

    const firstTag = orderCard.tags[0];
    const qrTextPayload = `==============================
   CLEAN QUICK LAUNDRY TAG
==============================
Order ID: ORD-${orderCard.id}
Tag Code: ${firstTag?.qr_code ? `#${firstTag.qr_code.slice(0, 8)}` : `ORD-${orderCard.id}`}
Customer: ${orderCard.customer_name || 'Customer'} (${orderCard.address_area || 'In Area'})
Items: ${orderCard.items_summary || 'Garment Items'} (Qty: ${orderCard.total_qty || 1})
Current Stage: ${STAGE_CONFIG[orderCard.stage]?.label || orderCard.stage}
==============================`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrTextPayload)}`;
    const garmentImg = getGarmentImage(orderCard.items_summary);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slide-left">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-800">Order Inspection</span>
                        <span className="text-[10px] font-black uppercase bg-[#f95700] text-white px-2 py-0.5 rounded-md font-mono">
                            ORD-{orderCard.id}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Visual QR & Garment Image Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200/80">
                        <div className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                            {qrUrl ? (
                                <img src={qrUrl} alt="QR Code" className="w-28 h-28 object-contain" />
                            ) : (
                                <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">QR Tag</div>
                            )}
                            <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">Order Tag</span>
                        </div>
                        <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative group">
                            <img src={garmentImg} alt="Garment" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Meta Details */}
                    <div className="space-y-3 divide-y divide-slate-100 text-xs">
                        <div className="pt-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Customer</span>
                            <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{orderCard.customer_name} ({orderCard.address_area})</span>
                        </div>

                        <div className="pt-2.5 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Items Breakdown</span>
                                <span className="font-extrabold text-slate-800">{orderCard.items_summary} (Total Qty: {orderCard.total_qty})</span>
                            </div>
                            {orderCard.priority_label && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                                    {orderCard.priority_label}
                                </span>
                            )}
                        </div>

                        <div className="pt-2.5 flex justify-between items-center">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Kanban Stage</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${STAGE_CONFIG[orderCard.stage]?.color || 'bg-slate-100 text-slate-800'}`}>
                                {STAGE_CONFIG[orderCard.stage]?.icon} {STAGE_CONFIG[orderCard.stage]?.label || orderCard.stage}
                            </span>
                        </div>
                    </div>

                    {/* Garment Tags List */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Garment Tags ({orderCard.tags.length})</span>
                        <div className="space-y-2">
                            {orderCard.tags.map((t) => (
                                <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-mono text-[10px] font-bold text-slate-500 block">#{t.qr_code.slice(0, 8)}</span>
                                        <span className="font-extrabold text-slate-800 capitalize">Stage: {STAGE_CONFIG[t.stage]?.label || t.stage}</span>
                                    </div>
                                    {t.issue_flag ? (
                                        <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase">Flagged</span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">OK</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Issue Reporting Form */}
                    {showIssue && (
                        <form onSubmit={submitIssue} noValidate className="space-y-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl animate-slide-down">
                            <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Report Stain / Damage Issue</h4>
                            <textarea
                                value={form.data.note}
                                onChange={(e) => form.setData('note', e.target.value)}
                                placeholder="Specify garment damage or stain details..."
                                className="w-full bg-white border border-rose-200 focus:border-rose-500 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                                rows={2}
                                required
                            />
                            {form.errors.note && <p className="text-xs text-rose-600 font-bold">{form.errors.note}</p>}
                            <button
                                type="submit"
                                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                            >
                                Confirm & Flag Issue
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                    {nextStage ? (
                        <button
                            onClick={advanceOrder}
                            className="w-full rounded-2xl bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold text-xs py-3 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>Mark as Complete</span>
                            <span className="text-[10px] font-normal text-orange-100">(Move to {STAGE_CONFIG[nextStage]?.label})</span>
                        </button>
                    ) : (
                        <div className="w-full rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold text-xs py-3 text-center">
                            ✨ Final Stage Passed (Ready for Bagging)
                        </div>
                    )}

                    <button
                        onClick={() => setShowIssue(!showIssue)}
                        className="w-full rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-xs py-2.5 transition-colors cursor-pointer"
                    >
                        {showIssue ? 'Cancel Issue Report' : 'Report Issue / Flag Stain'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Board({ toReceive, onFloor }) {
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [search, setSearch] = useState('');
    const [selectedOrderCard, setSelectedOrderCard] = useState(null);

    // Group on-floor orders into DISTINCT Order cards for Kanban Board (1 card per Order - NO DUPLICATES)
    const kanbanOrders = useMemo(() => {
        const ordersList = [];
        onFloor.data.forEach((order) => {
            const isB2b = order.user?.role === 'business_client';
            const isExpress = order.is_express;
            const items = order.items || [];
            
            // Extract all garment tags across all items
            const allTags = items.flatMap(i => i.garment_tags || []);
            
            // Total items count
            const totalQty = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 1), 0);
            
            // Service names summary
            const serviceNames = items.map(i => i.service?.name).filter(Boolean).join(', ');
            
            // Check if any tag has an issue flag
            const hasIssueFlag = allTags.some(t => t.issue_flag);
            
            // Determine overall order stage (minimum stage index across tags, default to 'washing')
            let minStageIndex = 0;
            if (allTags.length > 0) {
                const stageIndices = allTags.map(t => STAGES.indexOf(t.stage)).filter(i => i !== -1);
                if (stageIndices.length > 0) {
                    minStageIndex = Math.min(...stageIndices);
                }
            }
            const orderStage = STAGES[minStageIndex] || 'washing';

            ordersList.push({
                id: order.id,
                customer_name: order.user?.name || 'Customer',
                address_area: order.address?.service_area?.name || 'LOZELLS',
                items_summary: serviceNames || 'Garment Items',
                total_qty: totalQty,
                stage: orderStage,
                has_issue_flag: hasIssueFlag,
                priority_label: isB2b ? 'B2B Priority' : (isExpress ? 'Express Priority' : null),
                raw_order: order,
                tags: allTags
            });
        });
        return ordersList;
    }, [onFloor.data]);

    // Filter orders by search
    const filteredOrders = useMemo(() => {
        if (!search.trim()) return kanbanOrders;
        const q = search.toLowerCase();
        return kanbanOrders.filter((o) => 
            `ord-${o.id}`.includes(q) || 
            `#cl-${o.id}`.includes(q) || 
            o.customer_name.toLowerCase().includes(q) || 
            o.items_summary.toLowerCase().includes(q)
        );
    }, [kanbanOrders, search]);

    // Group orders by Kanban Stage
    const kanbanColumns = useMemo(() => {
        const cols = {
            washing: [],
            drying: [],
            ironing: [],
            quality_check: [],
            ready: []
        };

        filteredOrders.forEach((orderCard) => {
            if (cols[orderCard.stage]) {
                cols[orderCard.stage].push(orderCard);
            } else {
                cols.washing.push(orderCard);
            }
        });

        return cols;
    }, [filteredOrders]);

    // Orders ready to finalize
    const readyToFinalizeOrders = useMemo(() => {
        return onFloor.data.filter((order) => {
            const tags = order.items?.flatMap(i => i.garment_tags || []) || [];
            return tags.length > 0 && tags.every(t => t.stage === 'quality_check');
        });
    }, [onFloor.data]);

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 animate-fade-in pb-12">
            
            {/* Full Width Header Card Container */}
            <div className="w-full rounded-3xl border border-orange-200/80 bg-[#fefefe] p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shop Floor Workflow</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold max-w-xl">
                        Real-time laundry processing workflow, stage progression, QR garment inspection, and intake audit.
                    </p>
                </div>

                {/* Right Controls Container */}
                <div className="rounded-2xl border border-orange-100 bg-slate-50/80 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    {/* View Switcher Tabs */}
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`py-2 px-3.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                viewMode === 'kanban' 
                                    ? 'bg-slate-900 text-white shadow-2xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>≡</span>
                            <span>Kanban Workflow</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`py-2 px-3.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                viewMode === 'list' 
                                    ? 'bg-slate-900 text-white shadow-2xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Intake & Audit List ({toReceive.data.length})</span>
                        </button>
                    </div>

                    {/* Search Input Box */}
                    <div className="relative min-w-[220px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search ORD-ID or Garment..."
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 pl-9 text-xs font-semibold text-slate-800 focus:outline-none"
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                    </div>
                </div>
            </div>

            {/* Ready for Finalization Banners */}
            {readyToFinalizeOrders.length > 0 && (
                <div className="space-y-3">
                    {readyToFinalizeOrders.map((order) => (
                        <FinalizeOrder key={order.id} order={order} />
                    ))}
                </div>
            )}

            {/* VIEW MODE 1: KANBAN WORKFLOW BOARD (Distinct Order Cards - NO DUPLICATES) */}
            {viewMode === 'kanban' && (
                <div className="space-y-6">
                    {/* 5-Column Kanban Board Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {STAGES.map((stageKey) => {
                            const colConfig = STAGE_CONFIG[stageKey];
                            const ordersInCol = kanbanColumns[stageKey] || [];

                            return (
                                <div key={stageKey} className="bg-slate-200/50 rounded-3xl p-3.5 border border-slate-200 flex flex-col h-[680px]">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-300/60">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{colConfig.icon}</span>
                                            <span className="font-extrabold text-xs text-slate-800">{colConfig.label}</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-300/80 text-slate-800 font-extrabold text-[10px]">
                                            {ordersInCol.length}
                                        </span>
                                    </div>

                                    {/* Scrollable Column Cards Container */}
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                        {ordersInCol.map((orderCard) => (
                                            <div
                                                key={orderCard.id}
                                                onClick={() => setSelectedOrderCard(orderCard)}
                                                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer space-y-2.5 relative group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="text-xs font-black text-slate-900 block">
                                                            Order ID: ORD-{orderCard.id}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                                                            Items: {orderCard.total_qty.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Badges */}
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    {orderCard.priority_label && (
                                                        <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                                                            {orderCard.priority_label}
                                                        </span>
                                                    )}
                                                    {orderCard.has_issue_flag && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white animate-pulse">
                                                            ⚠️ ISSUE FLAGGED
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {ordersInCol.length === 0 && (
                                            <div className="h-32 rounded-2xl border-2 border-dashed border-slate-300/70 flex items-center justify-center text-slate-400 text-xs font-semibold">
                                                Empty Stage
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* VIEW MODE 2: INTAKE & AUDIT LIST VIEW */}
            {viewMode === 'list' && (
                <div className="space-y-6">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                                AWAITING INTAKE COLLECTIONS ({toReceive.data.length})
                            </h2>
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        </div>
                        
                        {/* 3-Column Grid of Receive Cards */}
                        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {toReceive.data.map((order) => (
                                <ReceiveOrderCard key={order.id} order={order} />
                            ))}
                        </div>
                        {toReceive.data.length === 0 && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 font-semibold text-xs shadow-2xs">
                                No orders awaiting intake collection receipt.
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* Side Drawer Modal for Detailed Inspection */}
            {selectedOrderCard && (
                <OrderDetailDrawer
                    orderCard={selectedOrderCard}
                    onClose={() => setSelectedOrderCard(null)}
                />
            )}
        </div>
    );
}

Board.layout = (page) => <ShopLayout children={page} />;
