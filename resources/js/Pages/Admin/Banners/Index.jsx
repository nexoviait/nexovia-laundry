import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ banners }) {
    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({ title: '', image: null, link: '', sort_order: 0 });

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/banners', {
            forceFormData: true,
            onSuccess: () => {
                newForm.reset();
                setShowNew(false);
            },
        });
    }

    function toggleActive(banner) {
        router.put(`/admin/banners/${banner.id}`, { active: !banner.active }, { preserveScroll: true });
    }

    function remove(banner) {
        if (confirm(`Remove banner "${banner.title}"?`)) {
            router.delete(`/admin/banners/${banner.id}`, { preserveScroll: true });
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Homepage Banners</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">Promotional banners shown on the customer app/website home screen.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-200"
                >
                    {showNew ? '✕ Cancel' : '＋ New Banner'}
                </button>
            </div>

            {showNew && (
                <form onSubmit={submitNew} className="rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/20 p-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Title</label>
                            <input
                                required
                                value={newForm.data.title}
                                onChange={(e) => newForm.setData('title', e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Link (optional)</label>
                            <input
                                value={newForm.data.link}
                                onChange={(e) => newForm.setData('link', e.target.value)}
                                placeholder="https://…"
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                required
                                onChange={(e) => newForm.setData('image', e.target.files[0])}
                                className="w-full text-xs font-semibold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Sort Order</label>
                            <input
                                type="number"
                                value={newForm.data.sort_order}
                                onChange={(e) => newForm.setData('sort_order', e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                            />
                        </div>
                    </div>
                    {newForm.errors.image && <p className="text-xs font-bold text-rose-600">{newForm.errors.image}</p>}
                    <div className="flex justify-end">
                        <button type="submit" disabled={newForm.processing} className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold">
                            Save Banner
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {banners.data.map((banner) => (
                    <div key={banner.id} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        {banner.image_url && (
                            <img src={banner.image_url} alt={banner.title} className="h-36 w-full object-cover" />
                        )}
                        <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-sm text-slate-900">{banner.title}</h3>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${banner.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    {banner.active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <button onClick={() => toggleActive(banner)} className="text-xs font-bold text-orange-600 hover:underline">
                                    {banner.active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => remove(banner)} className="text-xs font-bold text-rose-600 hover:underline">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {banners.data.length === 0 && (
                    <p className="col-span-full text-center text-slate-400 font-semibold py-10">No banners yet.</p>
                )}
            </div>
        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;
