import { useForm, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function New({ services, serviceAreas, timeSlots }) {
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

    function updateItem(index, field, value) {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, { service_id: '', qty: 1 }]);
    }

    function removeItem(index) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function submit(e) {
        e.preventDefault();
        post('/admin/orders');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <span className="text-xs font-bold text-slate-400">OPERATIONAL CENTER</span>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">Manual Order Entry</h1>
                </div>
                <Link
                    href="/admin/orders"
                    className="rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                >
                    ← Back to Board
                </Link>
            </div>

            <form onSubmit={submit} className="max-w-3xl">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">

                    {/* Customer Info Section */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            1. Customer Details
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Customer Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="text"
                                    required
                                    placeholder="e.g. +447700900555"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                />
                                {errors.phone && <p className="text-xs text-rose-600 font-bold mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Customer Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                />
                                {errors.name && <p className="text-xs text-rose-600 font-bold mt-1">{errors.name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            2. Delivery Address
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="label" className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Address Label
                                </label>
                                <input
                                    id="label"
                                    type="text"
                                    required
                                    placeholder="Home, Office, etc."
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="postcode" className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Postcode
                                </label>
                                <input
                                    id="postcode"
                                    type="text"
                                    required
                                    placeholder="B19 3AB"
                                    value={data.postcode}
                                    onChange={(e) => setData('postcode', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                />
                                {errors.postcode && <p className="text-xs text-rose-600 font-bold mt-1">{errors.postcode}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="directions" className="block text-xs font-bold text-slate-700 mb-1.5">
                                Delivery Directions (optional)
                            </label>
                            <input
                                id="directions"
                                type="text"
                                placeholder="Ground floor flat, blue door..."
                                value={data.directions}
                                onChange={(e) => setData('directions', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Schedule Time Slot Section */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            3. Select Slot
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="filter_area" className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Filter Slots by Area
                                </label>
                                <select
                                    id="filter_area"
                                    value={areaId}
                                    onChange={(e) => {
                                        setAreaId(e.target.value);
                                        setData('time_slot_id', '');
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">All areas</option>
                                    {serviceAreas.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name} {!a.active && '(inactive)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="time_slot" className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Pickup Time Slot
                                </label>
                                <select
                                    id="time_slot"
                                    required
                                    value={data.time_slot_id}
                                    onChange={(e) => setData('time_slot_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select a slot</option>
                                    {Object.keys(slotsByDate).map((date) => (
                                        <optgroup key={date} label={date}>
                                            {slotsByDate[date].map((s) => (
                                                <option key={s.id} value={s.id} disabled={s.capacity <= 0}>
                                                    {s.window} ({s.capacity} left) {s.capacity <= 0 ? '[Full]' : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {errors.time_slot_id && <p className="text-xs text-rose-600 font-bold mt-1">{errors.time_slot_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Services Items Basket Section */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                            4. Items Basket
                        </h2>

                        <div className="space-y-3">
                            {data.items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center w-full">
                                    <select
                                        required
                                        value={item.service_id}
                                        onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                                        className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">Select service</option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} (Price: £{parseFloat(s.price).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={item.qty}
                                        onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                                        className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-center text-slate-800 focus:outline-none"
                                    />

                                    {data.items.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="h-10 w-10 rounded-xl border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 bg-white flex items-center justify-center transition-colors shrink-0"
                                        >
                                            ✕
                                        </button>
                                    ) : (
                                        <div className="w-10 shrink-0"></div>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addItem}
                                className="w-full py-2.5 border border-dashed border-slate-200 hover:border-orange-400 rounded-xl text-xs font-bold text-orange-600 hover:text-orange-700 bg-white transition-colors"
                            >
                                + Add another item
                            </button>
                        </div>
                    </div>

                    {/* Note & Submit Section */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="note" className="block text-xs font-bold text-slate-700 mb-1.5">
                                Order Note / Instruction (optional)
                            </label>
                            <textarea
                                id="note"
                                rows="3"
                                placeholder="Any special delivery instructions..."
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                            />
                            {errors.note && <p className="text-xs text-rose-600 font-bold mt-1">{errors.note}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 shadow-lg shadow-orange-200 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm"
                        >
                            {processing ? 'Creating Order...' : 'Create Order'}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}

New.layout = (page) => <Layout children={page} />;
