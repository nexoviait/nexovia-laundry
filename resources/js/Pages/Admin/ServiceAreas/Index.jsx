import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ serviceAreas }) {
    const { props } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[props.settings?.currency || 'GBP'] || '£';
    const globalDeliveryFee = parseFloat(props.settings?.delivery_fee || '0');

    const [showNew, setShowNew] = useState(false);
    const newForm = useForm({
        name: '',
        country: 'United Kingdom',
        postcode: '',
        delivery_charge: '',
        active: true
    });

    const [editingAreaId, setEditingAreaId] = useState(null);
    const [editName, setEditName] = useState('');

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/service-areas', {
            onSuccess: () => {
                newForm.reset();
                setShowNew(false);
            }
        });
    }

    function updateField(area, field, value) {
        router.put(`/admin/service-areas/${area.id}`, { [field]: value }, { preserveScroll: true });
    }

    function toggle(area) {
        router.post(`/admin/service-areas/${area.id}/toggle`, {}, { preserveScroll: true });
    }

    function remove(area) {
        if (confirm(`Are you sure you want to delete delivery zone "${area.name}"?`)) {
            router.delete(`/admin/service-areas/${area.id}`, { preserveScroll: true });
        }
    }

    function startEditingName(area) {
        setEditingAreaId(area.id);
        setEditName(area.name);
    }

    function saveName(area) {
        if (editName && editName !== area.name) {
            updateField(area, 'name', editName);
        }
        setEditingAreaId(null);
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery Zones</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Define geographic laundry coverage regions, postcodes, custom delivery charges, and dispatch status.
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-200 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                >
                    <span>{showNew ? '✕' : '＋'}</span>
                    <span>New Delivery Zone</span>
                </button>
            </div>

            {/* Split Grid Layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Left Columns: Delivery Zones Configuration Cards */}
                <div className="lg:col-span-2 space-y-5">
                    
                    {/* Add New Zone Form */}
                    {showNew && (
                        <form onSubmit={submitNew} className="rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/20 p-6 space-y-4 animate-slide-down">
                            <h3 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Configure New Delivery Zone</h3>
                            
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Zone Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newForm.data.name}
                                        onChange={(e) => newForm.setData('name', e.target.value)}
                                        placeholder="e.g. Dhaka"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {newForm.errors.name && <p className="text-[10px] text-red-650 font-bold">{newForm.errors.name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Country</label>
                                    <input
                                        type="text"
                                        required
                                        value={newForm.data.country}
                                        onChange={(e) => newForm.setData('country', e.target.value)}
                                        placeholder="e.g. Bangladesh"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {newForm.errors.country && <p className="text-[10px] text-red-650 font-bold">{newForm.errors.country}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-550 uppercase">Postcode Prefix</label>
                                    <input
                                        type="text"
                                        required
                                        value={newForm.data.postcode}
                                        onChange={(e) => newForm.setData('postcode', e.target.value)}
                                        placeholder="e.g. 1000"
                                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {newForm.errors.postcode && <p className="text-[10px] text-red-650 font-bold">{newForm.errors.postcode}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-550 uppercase">Delivery Charge Override</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-3 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newForm.data.delivery_charge}
                                            onChange={(e) => newForm.setData('delivery_charge', e.target.value)}
                                            placeholder={`Default: ${globalDeliveryFee.toFixed(2)}`}
                                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-7 pr-3 text-xs font-semibold focus:outline-none"
                                        />
                                    </div>
                                    {newForm.errors.delivery_charge && <p className="text-[10px] text-red-650 font-bold">{newForm.errors.delivery_charge}</p>}
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
                                    className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-50"
                                >
                                    Add Zone
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Zone Cards List */}
                    {serviceAreas.map((area) => {
                        const isEditingName = editingAreaId === area.id;
                        const isAreaActive = area.active;
                        const hasCustomCharge = area.delivery_charge !== null && area.delivery_charge !== undefined;
                        const finalCharge = hasCustomCharge ? parseFloat(area.delivery_charge) : globalDeliveryFee;

                        return (
                            <div key={area.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 hover:border-slate-350 transition-all">
                                
                                {/* Card Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <span className={`h-11 w-11 rounded-2xl ${isAreaActive ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-400'} flex items-center justify-center font-extrabold text-sm shrink-0`}>
                                            📍
                                        </span>
                                        
                                        <div>
                                            {isEditingName ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onBlur={() => saveName(area)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveName(area)}
                                                    className="border-b border-blue-500 font-extrabold text-base text-slate-900 focus:outline-none py-0.5"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-base text-slate-900">{area.name}</h3>
                                                    <button 
                                                        onClick={() => startEditingName(area)}
                                                        className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[10px] font-extrabold text-orange-700 uppercase tracking-widest">
                                                    🌍 {area.country || 'United Kingdom'}
                                                </span>
                                                <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-550 uppercase tracking-widest">
                                                    POSTCODE Prefix: {area.postcode}
                                                </span>
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider ${
                                                    isAreaActive 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                    {isAreaActive ? 'Operational' : 'Paused'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggle(area)}
                                            className={`rounded-xl border font-extrabold text-xs px-3.5 py-1.5 transition-colors ${
                                                isAreaActive
                                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                                    : 'border-emerald-250 text-emerald-700 hover:bg-emerald-50'
                                            }`}
                                        >
                                            {isAreaActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(area)}
                                            className="rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 font-extrabold text-xs px-3 py-1.5 transition-colors"
                                            aria-label={`Delete ${area.name}`}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Form settings inputs */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-100/60">

                                    {/* Country update field */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Country</label>
                                        <input
                                            type="text"
                                            defaultValue={area.country || 'United Kingdom'}
                                            onBlur={(e) => {
                                                if (e.target.value && e.target.value !== area.country) {
                                                    updateField(area, 'country', e.target.value);
                                                }
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                        />
                                    </div>

                                    {/* Postcode prefix update field */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Postcode Prefix</label>
                                        <input
                                            type="text"
                                            defaultValue={area.postcode}
                                            onBlur={(e) => {
                                                if (e.target.value !== area.postcode) {
                                                    updateField(area, 'postcode', e.target.value);
                                                }
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                        />
                                    </div>

                                    {/* Delivery fee override */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Delivery Surcharge Override</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-slate-400 text-xs font-bold">{currencySymbol}</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={hasCustomCharge ? area.delivery_charge : ''}
                                                placeholder={`Default: ${globalDeliveryFee.toFixed(2)}`}
                                                onBlur={(e) => {
                                                    const val = e.target.value ? parseFloat(e.target.value) : null;
                                                    if (val !== (hasCustomCharge ? parseFloat(area.delivery_charge) : null)) {
                                                        updateField(area, 'delivery_charge', val);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 pl-6 pr-3 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Availability/Service Area status info */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-455 uppercase tracking-wider block">Dispatch Availability</label>
                                        <div className="flex items-center h-9 gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${isAreaActive ? 'bg-emerald-500' : 'bg-rose-500'} inline-block`}></span>
                                            <span className="text-xs font-bold text-slate-850">
                                                {isAreaActive ? 'Accepting Orders' : 'Delivery Suspended'}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}

                </div>

                {/* Right Panel: Interactive Coverage Map Graphic stub */}
                <div className="space-y-5">
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block text-center">ZONE DISPATCH RADAR</span>
                    
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="h-64 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-emerald-50 border border-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">

                            {/* Graphic elements grid */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>

                            {/* Target concentric pulses */}
                            <div className="absolute h-36 w-36 rounded-full border-2 border-orange-500/20 animate-ping"></div>
                            <div className="absolute h-24 w-24 rounded-full border-2 border-orange-500/10"></div>
                            
                            <span className="text-3xl relative z-10">📡</span>
                            <h4 className="font-extrabold text-xs text-slate-800 mt-3 relative z-10">Active Postcode Dispatchers</h4>
                            <p className="text-[10px] text-slate-400 font-semibold max-w-xs mt-1.5 leading-normal relative z-10">
                                Radar tracks postcodes ({serviceAreas.filter(a => a.active).map(a => a.postcode).join(', ')}) dynamically on customer address entry screens.
                            </p>
                        </div>
                        
                        <div className="text-xs font-semibold text-slate-500 space-y-3">
                            <h5 className="font-bold text-slate-900 border-b border-slate-50 pb-2">Operational Analytics</h5>
                            <div className="flex justify-between">
                                <span>Active Dispatch Areas</span>
                                <span className="font-bold text-slate-850">{serviceAreas.filter(a => a.active).length} Zones</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Suspended Areas</span>
                                <span className="font-bold text-slate-850">{serviceAreas.filter(a => !a.active).length} Zones</span>
                            </div>
                        </div>
                    </div>
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
