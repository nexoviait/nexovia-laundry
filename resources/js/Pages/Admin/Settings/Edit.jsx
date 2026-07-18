import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Edit({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        ...settings,
        remove_logo: false,
        _method: 'put'
    });
    const [logoPreview, setLogoPreview] = useState(data.business_logo || '');

    function handleRemoveLogo() {
        setLogoPreview('');
        setData((prev) => ({
            ...prev,
            business_logo: '',
            remove_logo: true
        }));
    }

    function submit(e) {
        e.preventDefault();
        post('/admin/settings', { preserveScroll: true });
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Configure currency constants, VAT rates, delivery surcharges, and default contact profiles.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-8">

                    {/* Section 1: Currency & Pricing */}
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Currency & Pricing</h3>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Control pricing units, taxes, and service margins.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Currency</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                >
                                    <option value="GBP">GBP (£)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                                {errors.currency && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.currency}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">VAT Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.vat_rate}
                                    onChange={(e) => setData('vat_rate', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                />
                                {errors.vat_rate && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.vat_rate}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Delivery Fee ({data.currency})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.delivery_fee}
                                    onChange={(e) => setData('delivery_fee', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                />
                                {errors.delivery_fee && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.delivery_fee}</p>}
                            </div>
                        </div>

                        {/* System Constants Helper Alert */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex gap-3 items-start">
                            <span className="text-orange-500 text-xs mt-0.5">ℹ️</span>
                            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                                <strong>System Constants Note:</strong> The currency value controls settings across all catalogs. Supported options: GBP (£), USD ($), EUR (€).
                            </p>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Business Profile */}
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Business Profile</h3>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Define corporate information displayed on customer invoices.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Brand Logo Upload */}
                            <div className="space-y-2 border-b border-slate-100 pb-4">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Brand Logo</label>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-12 w-auto max-w-[120px] rounded-xl border border-slate-200 bg-slate-50 object-contain p-1"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            No Logo
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setData((prev) => ({
                                                            ...prev,
                                                            business_logo: file,
                                                            remove_logo: false
                                                        }));
                                                        setLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="text-xs font-semibold text-slate-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                            />
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="px-2.5 py-1.5 text-[10px] font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all cursor-pointer"
                                                >
                                                    Remove Logo
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold">Recommended: PNG format with transparent background (max 2MB).</p>
                                    </div>
                                </div>
                                {errors.business_logo && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_logo}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Business Name</label>
                                <input
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                                />
                                {errors.business_name && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_name}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone</label>
                                    <input
                                        value={data.business_phone}
                                        onChange={(e) => setData('business_phone', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                                    />
                                    {errors.business_phone && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_phone}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email</label>
                                    <input
                                        type="text"
                                        value={data.business_email}
                                        onChange={(e) => setData('business_email', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                                    />
                                    {errors.business_email && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_email}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Address</label>
                                <textarea
                                    value={data.business_address}
                                    onChange={(e) => setData('business_address', e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                                />
                                {errors.business_address && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_address}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Opening Hours</label>
                                <input
                                    value={data.opening_hours}
                                    onChange={(e) => setData('opening_hours', e.target.value)}
                                    placeholder="Mon-Sat 08:00-18:00"
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                                />
                                {errors.opening_hours && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.opening_hours}</p>}
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Form Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-xs">💡</span>
                            <span className="text-[10px] font-bold leading-none">Verify all details before saving. Changes take effect system-wide immediately.</span>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-6 py-2.5 text-xs shadow-md shadow-orange-200 transition-all disabled:opacity-50 min-w-[140px]"
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Standard Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] font-bold text-slate-400 pt-6 border-t border-slate-100">
                <span>Clean Laundry System © 2026. All Rights Reserved.</span>
                <div className="flex gap-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">API Documentation</a>
                </div>
            </div>
        </div>
    );
}

Edit.layout = (page) => <Layout children={page} />;
