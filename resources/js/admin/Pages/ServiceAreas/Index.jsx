import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Layout';

export default function Index({ serviceAreas }) {
    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({ name: '', postcode: '', active: true });

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/service-areas', { onSuccess: () => { newForm.reset(); setShowNew(false); } });
    }

    function toggle(area) {
        router.post(`/admin/service-areas/${area.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Service areas</h1>
                <button onClick={() => setShowNew(!showNew)} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                    {showNew ? 'Cancel' : '+ New area'}
                </button>
            </div>

            {showNew && (
                <form onSubmit={submitNew} className="mb-6 grid grid-cols-3 gap-2 rounded bg-white p-4 shadow-sm">
                    <input
                        placeholder="Name (e.g. Lozells)"
                        value={newForm.data.name}
                        onChange={(e) => newForm.setData('name', e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <input
                        placeholder="Postcode prefix (e.g. B19)"
                        value={newForm.data.postcode}
                        onChange={(e) => newForm.setData('postcode', e.target.value)}
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
                            <th className="px-4 py-3">Postcode</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviceAreas.map((a) => (
                            <tr key={a.id} className="border-t border-slate-100">
                                <td className="px-4 py-2">{a.name}</td>
                                <td className="px-4 py-2">{a.postcode}</td>
                                <td className="px-4 py-2">
                                    <span className={`rounded-full px-2 py-1 text-xs ${a.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                        {a.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => toggle(a)} className="text-xs text-slate-600 underline">
                                        {a.active ? 'Deactivate' : 'Activate'}
                                    </button>
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
