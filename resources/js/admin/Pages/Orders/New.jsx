import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Layout from '../../Layout';

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
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold mb-6">Manual order entry</h1>

            <form onSubmit={submit} className="space-y-6 rounded bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Customer phone</label>
                        <input
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                        />
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Customer name</label>
                        <input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Address label</label>
                        <input
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Postcode</label>
                        <input
                            value={data.postcode}
                            onChange={(e) => setData('postcode', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                        />
                        {errors.postcode && <p className="text-sm text-red-600">{errors.postcode}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Directions (optional)</label>
                    <input
                        value={data.directions}
                        onChange={(e) => setData('directions', e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Filter slots by area</label>
                        <select
                            value={areaId}
                            onChange={(e) => setAreaId(e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                        >
                            <option value="">All areas</option>
                            {serviceAreas.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Pickup slot</label>
                        <select
                            value={data.time_slot_id}
                            onChange={(e) => setData('time_slot_id', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                        >
                            <option value="">Select a slot</option>
                            {filteredSlots.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.date} {s.window} (cap {s.capacity})
                                </option>
                            ))}
                        </select>
                        {errors.time_slot_id && <p className="text-sm text-red-600">{errors.time_slot_id}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Items</label>
                    <div className="space-y-2">
                        {data.items.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <select
                                    value={item.service_id}
                                    onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                                    className="flex-1 rounded border border-slate-300 px-3 py-2"
                                >
                                    <option value="">Select a service</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} — £{s.price} / {s.unit}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={item.qty}
                                    onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                    className="w-24 rounded border border-slate-300 px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="rounded border border-slate-300 px-3 text-slate-500"
                                    disabled={data.items.length === 1}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addItem} className="mt-2 text-sm text-slate-600 underline">
                        + Add item
                    </button>
                    {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Note (optional)</label>
                    <textarea
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2"
                        rows={2}
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
                >
                    Create order
                </button>
            </form>
        </div>
    );
}

New.layout = (page) => <Layout children={page} />;
