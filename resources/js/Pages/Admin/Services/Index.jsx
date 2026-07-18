import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ services }) {
    const { props } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[props.settings?.currency || 'GBP'] || '£';

    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({
        name: '',
        category: 'Wash & Fold',
        unit: 'item',
        price: '',
        express_price: '',
        tat: '24',
        express_tat: '6',
        active: true
    });

    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editName, setEditName] = useState('');

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/services', {
            onSuccess: () => {
                newForm.reset();
                setShowNew(false);
            }
        });
    }

    function updateField(service, field, value) {
        router.put(`/admin/services/${service.id}`, { [field]: value }, { preserveScroll: true });
    }

    function remove(service) {
        if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
            router.delete(`/admin/services/${service.id}`, { preserveScroll: true });
        }
    }

    function startEditingName(service) {
        setEditingServiceId(service.id);
        setEditName(service.name);
    }

    function saveName(service) {
        if (editName && editName !== service.name) {
            updateField(service, 'name', editName);
        }
        setEditingServiceId(null);
    }

    // Helper for icons based on service names
    function getServiceIcon(name) {
        const lower = name.toLowerCase();
        if (lower.includes('dry') || lower.includes('clean')) {
            return (
                <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            );
        }
        if (lower.includes('press') || lower.includes('iron')) {
            return (
                <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            );
        }
        // Default Wash & Fold
        return (
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Service Catalog</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Manage your offerings, pricing models, and operational turnaround configurations.
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-200 transition-all duration-150"
                >
                    <span>{showNew ? '✕' : '＋'}</span>
                    <span>New Service</span>
                </button>
            </div>

            {/* Split Panel Layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Left Panel: Service Cards Configuration List */}
                <div className="lg:col-span-2 space-y-5">

                    {/* New Service Card/Form */}
                    {showNew && (
                        <form onSubmit={submitNew} className="rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/20 p-6 space-y-4 animate-slide-down">
                            <h3 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Configure New Service</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newForm.data.name}
                                        onChange={(e) => newForm.setData('name', e.target.value)}
                                        placeholder="e.g. Wash & Fold Premium"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                                    <select
                                        value={newForm.data.category}
                                        onChange={(e) => newForm.setData('category', e.target.value)}
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                                    >
                                        <option value="Wash & Fold">Wash & Fold</option>
                                        <option value="Dry Cleaning">Dry Cleaning</option>
                                        <option value="Ironing/Pressing">Ironing & Pressing</option>
                                        <option value="Duvet & Bulky">Duvet & Bulky</option>
                                        <option value="Bedding & Linens">Bedding & Linens</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Pricing Unit</label>
                                    <select
                                        value={newForm.data.unit}
                                        onChange={(e) => newForm.setData('unit', e.target.value)}
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                                    >
                                        <option value="item">per Item (item)</option>
                                        <option value="kg">per Pound / Kg (kg)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Base Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newForm.data.price}
                                        onChange={(e) => newForm.setData('price', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Express Price (Optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newForm.data.express_price}
                                        onChange={(e) => newForm.setData('express_price', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Turnaround Time (Hours)</label>
                                    <input
                                        type="text"
                                        value={newForm.data.tat}
                                        onChange={(e) => newForm.setData('tat', e.target.value)}
                                        placeholder="24"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Express Turnaround Time (Hours)</label>
                                    <input
                                        type="text"
                                        value={newForm.data.express_tat}
                                        onChange={(e) => newForm.setData('express_tat', e.target.value)}
                                        placeholder="6"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNew(false)}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={newForm.processing}
                                    className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
                                >
                                    Save Service
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Services Cards */}
                    {services.map((s) => {
                        const iconBg = s.active ? 'bg-blue-50' : 'bg-slate-100';
                        const badgeColor = s.active 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-100 text-slate-400 border-slate-200';

                        const isEditingName = editingServiceId === s.id;

                        return (
                            <div key={s.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all">
                                
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className={`h-11 w-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
                                            {getServiceIcon(s.name)}
                                        </div>
                                        
                                        <div>
                                            {isEditingName ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onBlur={() => saveName(s)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveName(s)}
                                                    className="border-b border-blue-500 font-extrabold text-base text-slate-900 focus:outline-none py-0.5"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-base text-slate-900">{s.name}</h3>
                                                    <button 
                                                        onClick={() => startEditingName(s)}
                                                        className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            )}
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold border mt-1 tracking-wider ${badgeColor}`}>
                                                {s.active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => remove(s)}
                                            className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Form settings inputs */}
                                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 pt-2">
                                    
                                    {/* Category */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Category</label>
                                        <select
                                            defaultValue={s.category || 'Wash & Fold'}
                                            onChange={(e) => updateField(s, 'category', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-2 text-xs font-bold text-slate-700 focus:outline-none"
                                        >
                                            <option value="Wash & Fold">Wash & Fold</option>
                                            <option value="Dry Cleaning">Dry Cleaning</option>
                                            <option value="Ironing/Pressing">Ironing & Pressing</option>
                                            <option value="Duvet & Bulky">Duvet & Bulky</option>
                                            <option value="Bedding & Linens">Bedding & Linens</option>
                                        </select>
                                    </div>

                                    {/* Price field */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Base Price</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={s.price}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val !== parseFloat(s.price)) {
                                                        updateField(s, 'price', val);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 pl-6 pr-1 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                            />
                                            <span className="absolute right-3 text-[10px] font-bold text-slate-400">
                                                /{s.unit === 'kg' ? 'lb' : 'item'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Express Price */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Express Price</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={s.express_price || ''}
                                                onBlur={(e) => {
                                                    const val = e.target.value ? parseFloat(e.target.value) : null;
                                                    if (val !== (s.express_price ? parseFloat(s.express_price) : null)) {
                                                        updateField(s, 'express_price', val);
                                                    }
                                                }}
                                                placeholder="—"
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 pl-6 pr-1 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Turnaround (TAT) */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Turnaround</label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                defaultValue={s.tat || '24'}
                                                onBlur={(e) => {
                                                    if (e.target.value !== s.tat) {
                                                        updateField(s, 'tat', e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                            />
                                            <span className="absolute right-3 text-[10px] font-bold text-slate-400">h</span>
                                        </div>
                                    </div>

                                    {/* Express Turnaround (TAT) */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Express TAT</label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                defaultValue={s.express_tat || ''}
                                                onBlur={(e) => {
                                                    if (e.target.value !== s.express_tat) {
                                                        updateField(s, 'express_tat', e.target.value);
                                                    }
                                                }}
                                                placeholder="—"
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                            />
                                            <span className="absolute right-3 text-[10px] font-bold text-slate-400">h</span>
                                        </div>
                                    </div>

                                    {/* Active toggle */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status</label>
                                        <div className="flex items-center h-9">
                                            <button
                                                type="button"
                                                onClick={() => updateField(s, 'active', !s.active)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                    s.active ? 'bg-orange-600' : 'bg-slate-200'
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        s.active ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                </div>

                {/* Right Panel: Interactive Customer App Preview */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-3">CUSTOMER APP PREVIEW</span>
                    
                    {/* Device frame container */}
                    <div className="relative w-[300px] h-[580px] rounded-[40px] border-[12px] border-slate-950 bg-slate-50 shadow-2xl overflow-hidden flex flex-col shrink-0">
                        {/* Status bar notch */}
                        <div className="absolute top-0 inset-x-0 h-4 bg-slate-950 flex items-center justify-center z-20">
                            <span className="h-1.5 w-16 rounded-full bg-white/30"></span>
                        </div>

                        {/* App bar */}
                        <div className="bg-white pt-6 pb-3 px-4 border-b border-slate-100 flex items-center justify-between text-slate-800">
                            <button type="button" className="text-sm font-bold">←</button>
                            <span className="text-[11px] font-extrabold tracking-tight">Select Service</span>
                            <button type="button" className="text-xs">🛒</button>
                        </div>

                        {/* App Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            
                            {services.length > 0 && (
                                <div className="rounded-2xl bg-orange-600 text-white p-4 space-y-3.5 shadow-sm shadow-orange-100 relative">
                                    <span className="absolute top-3 right-3 text-xs">⭐</span>
                                    <div>
                                        <span className="text-[8px] font-bold text-orange-200 uppercase tracking-widest">Starting from</span>
                                        <p className="text-lg font-black">{currencySymbol}{parseFloat(services[0].price).toFixed(2)}/{services[0].unit === 'kg' ? 'lb' : 'item'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-xs">{services[0].name}</h4>
                                        <p className="text-[9px] text-orange-100 font-semibold mt-0.5">Ready in as little as {services[0].tat || '24'}h</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="w-full py-1.5 bg-white text-orange-600 text-[10px] font-black rounded-lg shadow-sm"
                                    >
                                        Order Now
                                    </button>
                                </div>
                            )}

                            {/* Secondary items grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {services.slice(1).map((s) => {
                                    const isAvailable = s.active;

                                    return (
                                        <div 
                                            key={s.id} 
                                            className={`rounded-2xl border bg-white p-3 flex flex-col items-center text-center justify-between h-24 ${
                                                isAvailable ? 'border-slate-100' : 'border-slate-100 opacity-60'
                                            }`}
                                        >
                                            <span className="text-base">{s.name.toLowerCase().includes('dry') ? '👕' : '⚙️'}</span>
                                            <div>
                                                <h5 className="text-[9px] font-extrabold text-slate-800 leading-tight truncate w-24">{s.name}</h5>
                                                <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                                                    {isAvailable ? `${currencySymbol}${parseFloat(s.price).toFixed(2)}/${s.unit === 'kg' ? 'lb' : 'item'}` : 'Unavailable'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mock Promo Banner */}
                            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex items-center justify-between">
                                <div>
                                    <h6 className="text-[9px] font-extrabold text-emerald-950">Monthly Subscription</h6>
                                    <p className="text-[8px] text-emerald-700 font-semibold mt-0.5">Up to 40lbs/month for {currencySymbol}49.99</p>
                                </div>
                                <span className="text-emerald-500 text-xs">🏷️</span>
                            </div>
                        </div>

                        {/* App Navigation tabbar */}
                        <div className="bg-white border-t border-slate-100 py-2.5 px-6 flex justify-between text-slate-400 text-xs">
                            <span className="text-orange-600">🏠</span>
                            <span>📅</span>
                            <span>⏱️</span>
                            <span>👤</span>
                        </div>
                    </div>

                    <p className="text-[9px] text-slate-400 font-bold text-center mt-3 max-w-[260px] leading-relaxed">
                        * Real-Time preview of the mobile application interface as seen by your customers.
                    </p>
                </div>

            </div>

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

Index.layout = (page) => <Layout children={page} />;
