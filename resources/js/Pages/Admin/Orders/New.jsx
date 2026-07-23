import { useForm, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function New({ services = [], serviceAreas = [], timeSlots = [] }) {
    const { props: pageProps } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[pageProps.settings?.currency || 'GBP'] || '£';
    const globalDeliveryFee = parseFloat(pageProps.settings?.default_delivery_charge || '2.50');
    const vatRate = parseFloat(pageProps.settings?.vat_rate || '20') / 100;

    const [areaId, setAreaId] = useState('');
    
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        name: '',
        label: 'Home',
        postcode: '',
        directions: '',
        time_slot_id: '',
        note: '',
        items: [{ service_id: '', qty: 1 }],
    });

    const filteredSlots = useMemo(
        () => (areaId ? timeSlots.filter((s) => String(s.service_area_id) === String(areaId)) : timeSlots),
        [areaId, timeSlots]
    );

    // Group filtered slots by date
    const slotsByDate = useMemo(() => {
        const groups = {};
        filteredSlots.forEach((slot) => {
            if (!groups[slot.date]) {
                groups[slot.date] = [];
            }
            groups[slot.date].push(slot);
        });
        return groups;
    }, [filteredSlots]);

    // Service Map for price calculation
    const serviceMap = useMemo(() => {
        const map = {};
        services.forEach((s) => {
            map[s.id] = s;
        });
        return map;
    }, [services]);

    // Real-time calculations
    const subtotal = useMemo(() => {
        return data.items.reduce((sum, item) => {
            const srv = serviceMap[item.service_id];
            const price = srv ? parseFloat(srv.price) || 0 : 0;
            const qty = parseInt(item.qty, 10) || 0;
            return sum + (price * qty);
        }, 0);
    }, [data.items, serviceMap]);

    // Selected Area Delivery Fee
    const selectedArea = useMemo(() => {
        return serviceAreas.find((a) => String(a.id) === String(areaId));
    }, [areaId, serviceAreas]);

    const deliveryFee = useMemo(() => {
        if (selectedArea && selectedArea.delivery_charge !== null && selectedArea.delivery_charge !== undefined) {
            return parseFloat(selectedArea.delivery_charge) || 0;
        }
        return globalDeliveryFee;
    }, [selectedArea, globalDeliveryFee]);

    const vatAmount = useMemo(() => subtotal * vatRate, [subtotal, vatRate]);
    const grandTotal = useMemo(() => subtotal + deliveryFee + vatAmount, [subtotal, deliveryFee, vatAmount]);

    function updateItem(index, field, value) {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    }

    function addItem() {
        const defaultServiceId = services.length > 0 ? services[0].id : '';
        setData('items', [...data.items, { service_id: defaultServiceId, qty: 1 }]);
    }

    function removeItem(index) {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_, i) => i !== index));
        }
    }

    function submit(e) {
        e.preventDefault();
        post('/admin/orders');
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Operational Counter Desk</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Manual Order Entry</h1>
                </div>
                <Link
                    href="/admin/orders"
                    className="self-start sm:self-auto rounded-xl border border-slate-250 hover:border-slate-350 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-all shadow-2xs flex items-center gap-2"
                >
                    <span>←</span>
                    <span>Back to Orders Board</span>
                </Link>
            </div>

            <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-3 items-start">
                
                {/* Left Panel — Form Input Sections (2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Customer Identification Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                                    1
                                </span>
                                <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                    Customer Identification
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact</span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="phone" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Customer Phone Number <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3 text-slate-400 text-xs">📞</span>
                                    <input
                                        id="phone"
                                        type="text"
                                        required
                                        placeholder="e.g. +447700900555"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                {errors.phone && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Customer Full Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3 text-slate-400 text-xs">👤</span>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        placeholder="e.g. Priya Kaur"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                {errors.name && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 2. Delivery Location Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                                    2
                                </span>
                                <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                    Delivery & Service Address
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Fulfilment Destination</span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="label" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Address Label <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="label"
                                    type="text"
                                    required
                                    placeholder="e.g. Home, Apartment 4B"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                />
                                {errors.label && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.label}</p>}
                            </div>

                            <div>
                                <label htmlFor="postcode" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Postcode Prefix / Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="postcode"
                                    type="text"
                                    required
                                    placeholder="e.g. B19 3AB"
                                    value={data.postcode}
                                    onChange={(e) => setData('postcode', e.target.value)}
                                    className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white px-4 py-2.5 text-xs font-black uppercase text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                />
                                {errors.postcode && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.postcode}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="directions" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Delivery Directions / Gate Notes <span className="text-slate-400 font-medium">(optional)</span>
                            </label>
                            <input
                                id="directions"
                                type="text"
                                placeholder="Ground floor flat, blue door behind main gate..."
                                value={data.directions}
                                onChange={(e) => setData('directions', e.target.value)}
                                className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* 3. Schedule Time Slot Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                                    3
                                </span>
                                <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                    Pickup & Delivery Window
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Capacity</span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="filter_area" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Filter Slots by Area Zone
                                </label>
                                <select
                                    id="filter_area"
                                    value={areaId}
                                    onChange={(e) => {
                                        setAreaId(e.target.value);
                                        setData('time_slot_id', '');
                                    }}
                                    className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                >
                                    <option value="">All Active Delivery Zones</option>
                                    {serviceAreas.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}{a.postcode ? ` (${a.postcode})` : ''}{!a.active ? ' • (inactive)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="time_slot" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Pickup Time Slot <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="time_slot"
                                    required
                                    value={data.time_slot_id}
                                    onChange={(e) => setData('time_slot_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                >
                                    <option value="">Select available pickup slot</option>
                                    {Object.keys(slotsByDate).map((date) => {
                                        const formattedDate = (() => {
                                            const d = new Date(date);
                                            if (isNaN(d.getTime())) return date;
                                            return d.toLocaleDateString('en-GB', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            });
                                        })();

                                        return (
                                            <optgroup key={date} label={formattedDate}>
                                                {slotsByDate[date].map((s) => (
                                                    <option key={s.id} value={s.id} disabled={s.capacity <= 0}>
                                                        {s.window} ({s.capacity} available) {s.capacity <= 0 ? '[FULL]' : ''}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        );
                                    })}
                                </select>
                                {errors.time_slot_id && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.time_slot_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* 4. Items Manifest Basket Card */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                                    4
                                </span>
                                <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                    Garments & Services Manifest
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                {data.items.length} {data.items.length === 1 ? 'Item' : 'Items'} Selected
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            {data.items.map((item, index) => {
                                const selectedSrv = serviceMap[item.service_id];
                                const linePrice = selectedSrv ? (parseFloat(selectedSrv.price) * (parseInt(item.qty, 10) || 0)) : 0;

                                return (
                                    <div key={index} className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-2">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                            
                                            {/* Service Selection */}
                                            <div className="flex-1">
                                                <select
                                                    required
                                                    value={item.service_id}
                                                    onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                                                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-orange-500"
                                                >
                                                    <option value="">Select Service / Garment Offering</option>
                                                    {services.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            [{s.category || 'General'}] {s.name} — {currencySymbol}{parseFloat(s.price).toFixed(2)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Quantity Counter */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(index, 'qty', Math.max(1, (parseInt(item.qty, 10) || 1) - 1))}
                                                    className="h-8 w-8 rounded-lg bg-white border border-slate-250 text-slate-700 font-extrabold text-xs hover:bg-slate-100 flex items-center justify-center transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value, 10) || 1)}
                                                    className="w-14 rounded-lg border border-slate-250 bg-white py-1.5 text-xs font-black text-center text-slate-900 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(index, 'qty', (parseInt(item.qty, 10) || 0) + 1)}
                                                    className="h-8 w-8 rounded-lg bg-white border border-slate-250 text-slate-700 font-extrabold text-xs hover:bg-slate-100 flex items-center justify-center transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Line Total Readout */}
                                            <div className="w-24 text-right shrink-0">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Line Total</span>
                                                <span className="text-xs font-black text-slate-900">
                                                    {currencySymbol}{linePrice.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Remove Button */}
                                            {data.items.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="h-8 w-8 rounded-lg border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 bg-white flex items-center justify-center transition-colors shrink-0"
                                                    title="Remove item line"
                                                >
                                                    ✕
                                                </button>
                                            ) : (
                                                <div className="w-8 shrink-0"></div>
                                            )}
                                        </div>
                                        
                                        {(errors[`items.${index}.service_id`] || errors[`items.${index}.qty`]) && (
                                            <p className="text-[11px] text-rose-600 font-bold">
                                                {errors[`items.${index}.service_id`] || errors[`items.${index}.qty`]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl text-xs font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50/20 hover:bg-orange-50/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>＋</span>
                                <span>Add Another Garment Offering Item</span>
                            </button>
                        </div>

                        {/* Special Instruction Note */}
                        <div className="pt-2">
                            <label htmlFor="note" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                Booking Instructions / Notes <span className="text-slate-400 font-medium">(optional)</span>
                            </label>
                            <textarea
                                id="note"
                                rows="2"
                                placeholder="Add specific laundering instructions, delicate garment tags, or gate codes..."
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="w-full rounded-xl border border-slate-250 bg-slate-50/60 focus:bg-white p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            />
                            {errors.note && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.note}</p>}
                        </div>
                    </div>

                </div>

                {/* Right Panel — Real-time Checkout Calculation Card (1 Column) */}
                <div className="space-y-6 lg:sticky lg:top-20">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Order Summary</h3>
                            <span className="text-xs font-bold text-slate-500 font-mono">LIVE ESTIMATE</span>
                        </div>

                        {/* Itemized List Summary */}
                        <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                            {data.items.map((it, idx) => {
                                const srv = serviceMap[it.service_id];
                                if (!srv) return null;
                                const lTotal = (parseFloat(srv.price) * (parseInt(it.qty, 10) || 0));

                                return (
                                    <div key={idx} className="flex justify-between items-center text-slate-700 font-semibold">
                                        <span className="truncate pr-2">
                                            {srv.name} <span className="text-slate-400 font-bold">(x{it.qty})</span>
                                        </span>
                                        <span className="font-bold text-slate-900 shrink-0">
                                            {currencySymbol}{lTotal.toFixed(2)}
                                        </span>
                                    </div>
                                );
                            })}
                            {subtotal === 0 && (
                                <p className="text-[11px] text-slate-400 font-semibold italic text-center py-2">
                                    No services selected yet. Select a service to compute manifest.
                                </p>
                            )}
                        </div>

                        {/* Breakdown Totals */}
                        <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-600">
                            <div className="flex justify-between">
                                <span>Items Subtotal:</span>
                                <span className="text-slate-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span className="text-slate-900">{currencySymbol}{deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>VAT ({(vatRate * 100).toFixed(0)}%):</span>
                                <span>{currencySymbol}{vatAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm font-black text-slate-900">
                                <span>Estimated Grand Total:</span>
                                <span className="text-lg text-orange-600 font-black">
                                    {currencySymbol}{grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing || subtotal === 0}
                            className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 px-4 shadow-md shadow-orange-200 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none text-xs flex items-center justify-center gap-2"
                        >
                            <span>⚡</span>
                            <span>{processing ? 'Processing Booking...' : 'Create Order & Process Booking'}</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}

New.layout = (page) => <Layout children={page} />;
