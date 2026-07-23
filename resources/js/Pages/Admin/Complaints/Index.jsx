import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ complaints, filters, summary }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const complaintList = Array.isArray(complaints) ? complaints : (complaints.data || []);

    function handleFilterChange(newStatus) {
        setStatusFilter(newStatus);
        router.get('/admin/complaints', { status: newStatus }, { preserveState: true });
    }

    function updateStatus(id, newStatus) {
        router.put(`/admin/complaints/${id}`, { status: newStatus }, { preserveScroll: true });
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Complaints & Issue Desk</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Inspect customer-submitted issues, investigate order flags, and log resolutions.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Resolution</span>
                    <span className="text-2xl font-black text-rose-600">{summary.pending}</span>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Resolved Issues</span>
                    <span className="text-2xl font-black text-emerald-600">{summary.resolved}</span>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Logged Complaints</span>
                    <span className="text-2xl font-black text-slate-900">{summary.total}</span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full">
                    {['all', 'pending', 'investigating', 'resolved', 'closed'].map((st) => (
                        <button
                            key={st}
                            onClick={() => handleFilterChange(st)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                statusFilter === st
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Complaints Table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider bg-slate-50/50">
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Customer</th>
                                <th className="py-3 px-6">Order Ref</th>
                                <th className="py-3 px-6">Subject & Description</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {complaintList.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/40">
                                    <td className="py-4 px-6 font-mono font-extrabold text-slate-900">#{c.id}</td>
                                    <td className="py-4 px-6">
                                        <div className="font-extrabold text-slate-800">{c.user?.name || 'Customer'}</div>
                                        <div className="text-[10px] text-slate-400 font-semibold">{c.user?.phone || c.user?.email}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {c.order_id ? (
                                            <Link href={`/admin/orders/${c.order_id}`} className="text-orange-600 font-extrabold hover:underline">
                                                #CL-{c.order_id}
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 max-w-md">
                                        <div className="font-extrabold text-slate-900 text-xs">{c.subject}</div>
                                        <div className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">{c.description}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                            c.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            c.status === 'pending' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <select
                                            value={c.status}
                                            onChange={(e) => updateStatus(c.id, e.target.value)}
                                            className="bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="investigating">Investigating</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {complaintList.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs font-semibold">
                                        No complaints found for this status filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;
