import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Layout';

export default function Index({ timeSlots, serviceAreas, filters }) {
    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({ service_area_id: '', date: '', window: '', capacity: 10 });

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/time-slots', { onSuccess: () => { newForm.reset(); setShowNew(false); } });
    }

    function updateCapacity(slot, capacity) {
        router.put(`/admin/time-slots/${slot.id}`, { capacity }, { preserveScroll: true });
    }

    function remove(slot) {
        if (confirm('Remove this time slot?')) {
            router.delete(`/admin/time-slots/${slot.id}`, { preserveScroll: true });
        }
    }

    function filterByArea(id) {
        router.get('/admin/time-slots', id ? { service_area_id: id } : {}, { preserveState: true });
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Time slots</h1>
                <button onClick={() => setShowNew(!showNew)} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                    {showNew ? 'Cancel' : '+ New slot'}
                </button>
            </div>

            <select
                value={filters?.service_area_id || ''}
                onChange={(e) => filterByArea(e.target.value)}
                className="mb-4 rounded border border-slate-300 px-3 py-2 text-sm"
            >
                <option value="">All areas</option>
                {serviceAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                ))}
            </select>

            {showNew && (
                <form onSubmit={submitNew} className="mb-6 grid grid-cols-5 gap-2 rounded bg-white p-4 shadow-sm">
                    <select
                        value={newForm.data.service_area_id}
                        onChange={(e) => newForm.setData('service_area_id', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    >
                        <option value="">Area</option>
                        {serviceAreas.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={newForm.data.date}
                        onChange={(e) => newForm.setData('date', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <input
                        placeholder="09:00-12:00"
                        value={newForm.data.window}
                        onChange={(e) => newForm.setData('window', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <input
                        type="number"
                        value={newForm.data.capacity}
                        onChange={(e) => newForm.setData('capacity', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <button type="submit" className="rounded bg-slate-900 px-2 py-1.5 text-sm text-white">Add</button>
                </form>
            )}

            <div className="overflow-hidden rounded bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Area</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Window</th>
                            <th className="px-4 py-3">Capacity</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.data.map((s) => (
                            <tr key={s.id} className="border-t border-slate-100">
                                <td className="px-4 py-2">{s.service_area?.name}</td>
                                <td className="px-4 py-2">{s.date}</td>
                                <td className="px-4 py-2">{s.window}</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        defaultValue={s.capacity}
                                        onBlur={(e) => Number(e.target.value) !== s.capacity && updateCapacity(s, e.target.value)}
                                        className="w-20 rounded border border-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-300"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => remove(s)} className="text-xs text-red-600">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;
