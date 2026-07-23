import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ serviceAreas = [], availableZoneNames = [], availableCountries = [] }) {
    const defaultZoneNames = ['Dhaka', 'Chittagong', 'Motijheel', 'Lozells', 'Handsworth', 'Newtown', 'Sylhet', 'Mirpur', 'Banani', 'Gulshan'];
    const defaultCountries = ['Bangladesh', 'United Kingdom', 'United States', 'United Arab Emirates', 'Saudi Arabia', 'Canada'];

    const zoneList = availableZoneNames.length > 0 ? availableZoneNames : defaultZoneNames;
    const countryList = availableCountries.length > 0 ? availableCountries : defaultCountries;

    const { props } = usePage();
    const currencySymbol = { GBP: '£', USD: '$', EUR: '€' }[props.settings?.currency || 'GBP'] || '£';
    const globalDeliveryFee = parseFloat(props.settings?.delivery_fee || '0');

    const [showNew, setShowNew] = useState(false);
    const [isCustomZoneName, setIsCustomZoneName] = useState(false);
    const [isCustomCountryName, setIsCustomCountryName] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const totalAreasCount = serviceAreas.length;
    const activeAreasCount = serviceAreas.filter(a => a.active).length;
    const suspendedAreasCount = totalAreasCount - activeAreasCount;
    const activePct = totalAreasCount > 0 ? Math.round((activeAreasCount / totalAreasCount) * 100) : 0;
    const suspendedPct = totalAreasCount > 0 ? Math.round((suspendedAreasCount / totalAreasCount) * 100) : 0;

    const totalCharges = serviceAreas.reduce((acc, a) => acc + (a.delivery_charge !== null ? parseFloat(a.delivery_charge) : globalDeliveryFee), 0);
    const avgSurcharge = totalAreasCount > 0 ? (totalCharges / totalAreasCount).toFixed(2) : globalDeliveryFee.toFixed(2);
    const uniqueCountriesCount = new Set(serviceAreas.map(a => a.country).filter(Boolean)).size;

    const filteredAreas = serviceAreas.filter((area) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery = !q || 
            (area.name && area.name.toLowerCase().includes(q)) ||
            (area.postcode && area.postcode.toLowerCase().includes(q)) ||
            (area.country && area.country.toLowerCase().includes(q));
        
        const matchesStatus = 
            filterStatus === 'all' ? true :
            filterStatus === 'active' ? area.active :
            filterStatus === 'suspended' ? !area.active : true;

        return matchesQuery && matchesStatus;
    });

    const newForm = useForm({
        name: zoneList[0] || 'Dhaka',
        country: countryList[0] || 'United Kingdom',
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
                setIsCustomZoneName(false);
                setIsCustomCountryName(false);
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
                        <form onSubmit={submitNew} noValidate className="rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/20 p-6 space-y-4 animate-slide-down">
                            <h3 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Configure New Delivery Zone</h3>
                            
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Zone Name Select / Input */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Zone Name</label>
                                    {!isCustomZoneName ? (
                                        <select
                                            value={newForm.data.name}
                                            onChange={(e) => {
                                                if (e.target.value === '__custom__') {
                                                    setIsCustomZoneName(true);
                                                    newForm.setData('name', '');
                                                } else {
                                                    newForm.setData('name', e.target.value);
                                                }
                                            }}
                                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                        >
                                            <option value="">Select Zone Name</option>
                                            {zoneList.map((z) => (
                                                <option key={z} value={z}>{z}</option>
                                            ))}
                                            <option value="__custom__">＋ Enter Custom Zone Name...</option>
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                required
                                                value={newForm.data.name}
                                                onChange={(e) => newForm.setData('name', e.target.value)}
                                                placeholder="Type custom zone name"
                                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomZoneName(false);
                                                    newForm.setData('name', zoneList[0] || '');
                                                }}
                                                className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-700 font-bold shrink-0"
                                                title="Switch back to dropdown list"
                                            >
                                                ✕ List
                                            </button>
                                        </div>
                                    )}
                                    {newForm.errors.name && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.name}</p>}
                                </div>

                                {/* Country Select / Input */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Country</label>
                                    {!isCustomCountryName ? (
                                        <select
                                            value={newForm.data.country}
                                            onChange={(e) => {
                                                if (e.target.value === '__custom__') {
                                                    setIsCustomCountryName(true);
                                                    newForm.setData('country', '');
                                                } else {
                                                    newForm.setData('country', e.target.value);
                                                }
                                            }}
                                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                        >
                                            <option value="">Select Country</option>
                                            {countryList.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="__custom__">＋ Enter Custom Country...</option>
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                required
                                                value={newForm.data.country}
                                                onChange={(e) => newForm.setData('country', e.target.value)}
                                                placeholder="Type custom country"
                                                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomCountryName(false);
                                                    newForm.setData('country', countryList[0] || 'United Kingdom');
                                                }}
                                                className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-700 font-bold shrink-0"
                                                title="Switch back to dropdown list"
                                            >
                                                ✕ List
                                            </button>
                                        </div>
                                    )}
                                    {newForm.errors.country && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.country}</p>}
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
                                    {newForm.errors.postcode && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.postcode}</p>}
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
                                    {newForm.errors.delivery_charge && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.delivery_charge}</p>}
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
                    {filteredAreas.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
                            <span className="text-3xl inline-block">🔍</span>
                            <h4 className="font-extrabold text-sm text-slate-800">No delivery zones found</h4>
                            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                                No zones match your search query "{searchQuery}" or selected status "{filterStatus}". Try resetting your filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                            >
                                Reset Search Filters
                            </button>
                        </div>
                    ) : (
                        filteredAreas.map((area) => {
                            const isEditingName = editingAreaId === area.id;
                            const isAreaActive = area.active;
                            const hasCustomCharge = area.delivery_charge !== null && area.delivery_charge !== undefined;

                            return (
                                <div key={area.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 hover:border-slate-350 transition-all">
                                    
                                    {/* Card Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <span className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl ${isAreaActive ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-400'} flex items-center justify-center font-extrabold text-sm shrink-0`}>
                                                📍
                                            </span>
                                            
                                            <div className="min-w-0 flex-1">
                                                {isEditingName ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onBlur={() => saveName(area)}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveName(area)}
                                                        className="border-b border-blue-500 font-extrabold text-base text-slate-900 focus:outline-none py-0.5 w-full"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-extrabold text-base text-slate-900 truncate">{area.name}</h3>
                                                        <button 
                                                            onClick={() => startEditingName(area)}
                                                            className="text-slate-400 hover:text-slate-600 text-xs transition-colors shrink-0 cursor-pointer"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-orange-700 uppercase tracking-wider">
                                                        🌍 {area.country || 'United Kingdom'}
                                                    </span>
                                                    <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                                                        POSTCODE: {area.postcode}
                                                    </span>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider ${
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
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                                            <button
                                                type="button"
                                                onClick={() => toggle(area)}
                                                className={`rounded-xl border font-extrabold text-xs px-3 py-1.5 transition-colors cursor-pointer ${
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
                                                className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 h-8 w-8 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                                title="Delete Delivery Zone"
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
                                            <select
                                                defaultValue={area.country || 'United Kingdom'}
                                                onChange={(e) => {
                                                    if (e.target.value && e.target.value !== area.country) {
                                                        updateField(area, 'country', e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                                            >
                                                {countryList.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                                {!countryList.includes(area.country) && area.country && (
                                                    <option value={area.country}>{area.country}</option>
                                                )}
                                            </select>
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
                        })
                    )}

                </div>

                {/* Right Panel: Interactive Coverage Map Graphic & Operational Radar */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ZONE DISPATCH RADAR</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            LIVE RADAR
                        </span>
                    </div>
                    
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                        
                        {/* Radar Graphic Scanner Card */}
                        <div className="h-64 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg border border-slate-800">

                            {/* Radial Grid Pattern */}
                            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                            {/* Target Concentric Radar Pulses */}
                            <div className="absolute h-48 w-48 rounded-full border border-sky-500/20 animate-ping"></div>
                            <div className="absolute h-36 w-36 rounded-full border border-sky-400/30"></div>
                            <div className="absolute h-24 w-24 rounded-full border border-emerald-400/40"></div>
                            
                            <div className="relative z-10 space-y-1.5">
                                <span className="text-3xl inline-block drop-shadow-md">📡</span>
                                <h4 className="font-extrabold text-xs text-white tracking-wide">Postcode Dispatch Radar</h4>
                                <p className="text-[10px] text-slate-300 font-medium max-w-xs leading-normal">
                                    Tracking {activeAreasCount} active postcode dispatchers dynamically on customer address entry screens.
                                </p>
                            </div>

                            {/* Live Postcode Tag Cloud */}
                            <div className="mt-3 flex flex-wrap justify-center gap-1.5 relative z-10 max-h-16 overflow-y-auto px-1">
                                {serviceAreas.map(a => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => setSearchQuery(a.postcode)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all ${
                                            a.active
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                                        }`}
                                        title={`Filter list by postcode ${a.postcode}`}
                                    >
                                        {a.postcode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search & Filter Controls */}
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Search & Filter Zones</label>
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
                                    >
                                        Reset Search
                                    </button>
                                )}
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search zone or postcode..."
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-2 pl-8 pr-8 text-xs font-semibold text-slate-800 outline-none transition-all"
                                />
                                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-1.5 pt-1">
                                {['all', 'active', 'suspended'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFilterStatus(status)}
                                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition-all ${
                                            filterStatus === status
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Operational Analytics breakdown */}
                        <div className="text-xs font-semibold text-slate-600 space-y-3 pt-3 border-t border-slate-100">
                            <h5 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">Operational Analytics</h5>
                            
                            {/* Active Zones Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-slate-700">Active Dispatch Areas</span>
                                    <span className="font-extrabold text-emerald-700">{activeAreasCount} / {totalAreasCount} ({activePct}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${activePct}%` }}></div>
                                </div>
                            </div>

                            {/* Suspended Zones Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-bold text-slate-700">Suspended Areas</span>
                                    <span className="font-extrabold text-rose-700">{suspendedAreasCount} Zones ({suspendedPct}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${suspendedPct}%` }}></div>
                                </div>
                            </div>

                            {/* Average Surcharge */}
                            <div className="flex justify-between pt-2 border-t border-slate-100 text-xs">
                                <span className="font-bold text-slate-500">Average Delivery Surcharge</span>
                                <span className="font-extrabold text-slate-900">{currencySymbol}{avgSurcharge}</span>
                            </div>

                            {/* Coverage Countries */}
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-500">Active Coverage Countries</span>
                                <span className="font-extrabold text-slate-900">{uniqueCountriesCount} Countries</span>
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
