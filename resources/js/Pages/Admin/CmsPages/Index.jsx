import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ pages }) {
    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({ title: '', slug: '', content: '' });

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/cms-pages', {
            onSuccess: () => {
                newForm.reset();
                setShowNew(false);
            },
        });
    }

    function toggleActive(page) {
        router.put(`/admin/cms-pages/${page.id}`, { active: !page.active }, { preserveScroll: true });
    }

    function remove(page) {
        if (confirm(`Remove page "${page.title}"?`)) {
            router.delete(`/admin/cms-pages/${page.id}`, { preserveScroll: true });
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">CMS Pages</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">Static content pages — About, Terms, Privacy Policy, etc.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-200"
                >
                    {showNew ? '✕ Cancel' : '＋ New Page'}
                </button>
            </div>

            {showNew && (
                <form onSubmit={submitNew} noValidate className="rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/20 p-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Title</label>
                            <input
                                required
                                value={newForm.data.title}
                                onChange={(e) => newForm.setData('title', e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                            />
                            {newForm.errors.title && <p className="text-xs font-bold text-rose-600 mt-1">{newForm.errors.title}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Slug (optional)</label>
                            <input
                                value={newForm.data.slug}
                                onChange={(e) => newForm.setData('slug', e.target.value)}
                                placeholder="auto-generated from title"
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                            />
                            {newForm.errors.slug && <p className="text-xs font-bold text-rose-600 mt-1">{newForm.errors.slug}</p>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Content</label>
                        <textarea
                            required
                            rows={6}
                            value={newForm.data.content}
                            onChange={(e) => newForm.setData('content', e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                        />
                        {newForm.errors.content && <p className="text-xs font-bold text-rose-600 mt-1">{newForm.errors.content}</p>}
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={newForm.processing} className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold">
                            Save Page
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-5 py-3">Title</th>
                            <th className="px-5 py-3">Slug</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => (
                            <tr key={page.id} className="border-t border-slate-100">
                                <td className="px-5 py-3 font-bold text-slate-900">{page.title}</td>
                                <td className="px-5 py-3 text-slate-500 font-mono text-xs">/{page.slug}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${page.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                        {page.active ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right space-x-3">
                                    <button onClick={() => toggleActive(page)} className="text-xs font-bold text-orange-600 hover:underline">
                                        {page.active ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button onClick={() => remove(page)} className="text-xs font-bold text-rose-600 hover:underline">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 text-center text-slate-400 font-semibold">
                                    No CMS pages yet.
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
