import { router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ leads, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    function submitSearch(e) {
        e.preventDefault();
        router.get('/admin/leads', search ? { search } : {}, { preserveState: true });
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Captured Leads</h1>
                <p className="mt-1 text-slate-500 text-sm font-semibold">
                    Out-of-area booking attempts — follow up once these postcodes launch.
                </p>
            </div>

            <form onSubmit={submitSearch} className="flex gap-2">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by postcode or phone"
                    className="w-full max-w-sm bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                />
                <button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 shadow-sm">
                    Search
                </button>
            </form>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-5 py-3">Postcode</th>
                            <th className="px-5 py-3">Phone</th>
                            <th className="px-5 py-3">Customer</th>
                            <th className="px-5 py-3">Note</th>
                            <th className="px-5 py-3">Captured</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.data.map((lead) => (
                            <tr key={lead.id} className="border-t border-slate-100">
                                <td className="px-5 py-3 font-bold text-slate-900">{lead.postcode}</td>
                                <td className="px-5 py-3 text-slate-600">{lead.phone || '—'}</td>
                                <td className="px-5 py-3 text-slate-600">{lead.user?.name || '—'}</td>
                                <td className="px-5 py-3 text-slate-500">{lead.note || '—'}</td>
                                <td className="px-5 py-3 text-slate-400">{new Date(lead.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                        {leads.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                                    No leads captured yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;
