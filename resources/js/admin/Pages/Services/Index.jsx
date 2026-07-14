import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Layout';

export default function Index({ services }) {
    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({ name: '', unit: 'item', price: '', tat: '', active: true });

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/services', { onSuccess: () => { newForm.reset(); setShowNew(false); } });
    }

    function updateField(service, field, value) {
        router.put(`/admin/services/${service.id}`, { [field]: value }, { preserveScroll: true });
    }

    function remove(service) {
        if (confirm(`Remove ${service.name}?`)) {
            router.delete(`/admin/services/${service.id}`, { preserveScroll: true });
        }
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Services & pricing</h1>
                <button onClick={() => setShowNew(!showNew)} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                    {showNew ? 'Cancel' : '+ New service'}
                </button>
            </div>

            {showNew && (
                <form onSubmit={submitNew} className="mb-6 grid grid-cols-5 gap-2 rounded bg-white p-4 shadow-sm">
                    <input
                        placeholder="Name"
                        value={newForm.data.name}
                        onChange={(e) => newForm.setData('name', e.target.value)}
                        className="col-span-2 rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <select
                        value={newForm.data.unit}
                        onChange={(e) => newForm.setData('unit', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    >
                        <option value="item">item</option>
                        <option value="kg">kg</option>
                    </select>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={newForm.data.price}
                        onChange={(e) => newForm.setData('price', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <button type="submit" className="rounded bg-slate-900 px-2 py-1.5 text-sm text-white">Add</button>
                </form>
            )}

            <div className="overflow-hidden rounded bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Unit</th>
                            <th className="px-4 py-3">Price (£)</th>
                            <th className="px-4 py-3">TAT</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((s) => (
                            <tr key={s.id} className="border-t border-slate-100">
                                <td className="px-4 py-2">
                                    <input
                                        defaultValue={s.name}
                                        onBlur={(e) => e.target.value !== s.name && updateField(s, 'name', e.target.value)}
                                        className="w-full rounded border border-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-300"
                                    />
                                </td>
                                <td className="px-4 py-2">{s.unit}</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        defaultValue={s.price}
                                        onBlur={(e) => Number(e.target.value) !== Number(s.price) && updateField(s, 'price', e.target.value)}
                                        className="w-24 rounded border border-transparent px-1 py-0.5 hover:border-slate-200 focus:border-slate-300"
                                    />
                                </td>
                                <td className="px-4 py-2">{s.tat}</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={s.active}
                                        onChange={(e) => updateField(s, 'active', e.target.checked)}
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
