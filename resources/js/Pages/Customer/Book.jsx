import CustomerLayout from '@/Layouts/CustomerLayout';
import { useForm, usePage, Link } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

// Service icons helper with rich emoji badges
const SERVICE_ICONS = {
    Shirt: '👕',
    Trousers: '👖',
    Bedsheet: '🛏️',
    Dress: '👗',
    Duvet: '🛌',
    'Duvet (wash & dry)': '🛌',
    Jacket: '🧥',
    Panjabi: '👔',
    panjabi: '👔',
    default: '🧺'
};

export default function Book({ services, addresses, timeSlots, reorderItems }) {
    const { props } = usePage();
    const customerName = props.auth?.user?.name || 'Customer';
    const currency = props.settings?.currency || 'GBP';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [estimate, setEstimate] = useState(null);
    const [estimating, setEstimating] = useState(false);

    // Form setup
    const { data, setData, post, processing, errors } = useForm({
        address_id: '',
        time_slot_id: '',
        note: '',
        items: [], // { service_id, qty }
    });

    // Auto-load reorder items if present
    useEffect(() => {
        if (reorderItems && reorderItems.length > 0) {
            setData('items', reorderItems.map(item => ({
                service_id: item.service_id,
                qty: parseFloat(item.qty)
            })));
        }
    }, [reorderItems]);

    // Auto-select first address if available
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            handleSelectAddress(addresses[0]);
        }
    }, [addresses]);

    // Handle Address change
    function handleSelectAddress(addr) {
        setSelectedAddress(addr);
        setData((prev) => ({
            ...prev,
            address_id: addr.id,
            time_slot_id: '', // reset slot when address area changes
        }));
        setSelectedDate('');
    }

    // Filter time slots for current service area
    const areaSlots = useMemo(() => {
        if (!selectedAddress) return [];
        return timeSlots.filter((slot) => String(slot.service_area_id) === String(selectedAddress.service_area_id));
    }, [selectedAddress, timeSlots]);

    // Get unique dates from area slots
    const uniqueDates = useMemo(() => {
        const dates = areaSlots.map((s) => s.date);
        return [...new Set(dates)].sort();
    }, [areaSlots]);

    // Auto-select first date when address changes
    useEffect(() => {
        if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [uniqueDates, selectedDate]);

    // Filter slots for selected date
    const slotsForDate = useMemo(() => {
        if (!selectedDate) return [];
        return areaSlots.filter((slot) => slot.date === selectedDate);
    }, [selectedDate, areaSlots]);

    // Format weekday / month helper
    function formatDateLabel(dateString) {
        const date = new Date(dateString);
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return { weekday, day, month };
    }

    // Handle Qty change
    function handleQtyChange(serviceId, change) {
        const items = [...data.items];
        const existingIndex = items.findIndex((i) => i.service_id === serviceId);

        if (existingIndex > -1) {
            const newQty = Math.max(0, items[existingIndex].qty + change);
            if (newQty === 0) {
                items.splice(existingIndex, 1);
            } else {
                items[existingIndex].qty = newQty;
            }
        } else if (change > 0) {
            items.push({ service_id: serviceId, qty: change });
        }

        setData('items', items);
    }

    // Live estimated calculations
    useEffect(() => {
        if (data.items.length === 0) {
            setEstimate(null);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setEstimating(true);
            try {
                const response = await axios.post('/book/estimate', {
                    items: data.items,
                    address_id: data.address_id || null,
                });
                setEstimate(response.data);
            } catch (err) {
                console.error('Pricing estimate error:', err);
            } finally {
                setEstimating(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [data.items, data.address_id]);

    function getMissingRequirementMessage() {
        if (data.items.length === 0) return 'Please select at least 1 laundry service in Step 1.';
        if (!data.address_id) return 'Please select a pickup address in Step 2.';
        if (!data.time_slot_id) return 'Please choose a pickup date & time slot in Step 3.';
        return null;
    }

    function submitOrder(e) {
        e.preventDefault();
        const missing = getMissingRequirementMessage();
        if (missing) {
            if (data.items.length === 0) {
                document.getElementById('step-1-services')?.scrollIntoView({ behavior: 'smooth' });
            } else if (!data.address_id) {
                document.getElementById('step-2-address')?.scrollIntoView({ behavior: 'smooth' });
            } else if (!data.time_slot_id) {
                document.getElementById('step-3-slot')?.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }
        post('/book');
    }

    const missingMessage = getMissingRequirementMessage();

    return (
        <CustomerLayout>
            <div className="grid gap-8 lg:grid-cols-12 items-start animate-fade-in pb-12">
                
                {/* Left Column: 3 Wizard Steps */}
                <div className="lg:col-span-7 space-y-8">
                    
                    {/* Standard Premium Hero Card */}
                    <div className="bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 rounded-3xl p-8 sm:p-9 border border-orange-200/60 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
                        <div className="space-y-2 max-w-md relative z-10">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f95700] bg-white px-3.5 py-1 rounded-full border border-orange-200/80 shadow-2xs inline-flex items-center gap-1.5">
                                <span>🧺</span> STEP-BY-STEP BOOKING
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                                Welcome back, {customerName}
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                                Select your items below and schedule your home pickup in minutes.
                            </p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-4 flex items-center gap-4 shadow-sm relative z-10">
                            <div>
                                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Package Balance</span>
                                <div className="text-xl font-black text-slate-900 mt-0.5">{currencySymbol}142.50</div>
                            </div>
                            <button type="button" className="bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all">
                                Top Up
                            </button>
                        </div>
                    </div>

                    {/* Step 1: Select Services */}
                    <div className="space-y-4" id="step-1-services">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-full bg-[#f95700] text-white flex items-center justify-center text-xs font-black shadow-sm">1</span>
                                <span>Select Services</span>
                            </h2>
                            <span className="text-xs text-slate-500 font-semibold">
                                {data.items.reduce((sum, i) => sum + i.qty, 0)} Items Added
                            </span>
                        </div>

                        {/* Standard Service Cards Grid */}
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => {
                                const qty = data.items.find((i) => i.service_id === service.id)?.qty || 0;
                                const iconEmoji = SERVICE_ICONS[service.name] || SERVICE_ICONS[service.name?.toLowerCase()] || SERVICE_ICONS.default;
                                const formattedName = service.name ? service.name.charAt(0).toUpperCase() + service.name.slice(1) : 'Service';

                                return (
                                    <div
                                        key={service.id}
                                        className={`rounded-3xl border bg-white p-5 shadow-2xs flex flex-col justify-between h-56 transition-all duration-200 group ${
                                            qty > 0 ? 'border-2 border-[#f95700] ring-4 ring-orange-500/10 bg-orange-50/20 shadow-md' : 'border-slate-200/80 hover:border-orange-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <span className={`inline-flex h-12 w-12 rounded-2xl items-center justify-center text-2xl transition-transform group-hover:scale-105 ${
                                                qty > 0 ? 'bg-orange-100 text-[#f95700] border border-orange-200' : 'bg-slate-100/80 text-slate-700 border border-slate-200/60'
                                            }`}>
                                                {iconEmoji}
                                            </span>
                                            <div>
                                                <h3 className="font-extrabold text-slate-900 text-base leading-tight">{formattedName}</h3>
                                                <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1">
                                                    Professional standard cleaning per {service.unit}.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Price</span>
                                                <span className="text-sm font-extrabold text-slate-900">
                                                    {currencySymbol}{parseFloat(service.price).toFixed(2)}
                                                    <span className="text-xs font-semibold text-slate-500">/{service.unit}</span>
                                                </span>
                                            </div>
                                            
                                            {qty > 0 ? (
                                                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-orange-300 shadow-2xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQtyChange(service.id, -1)}
                                                        className="h-7 w-7 bg-orange-100 hover:bg-orange-200 rounded-lg font-black text-[#f95700] flex items-center justify-center text-xs transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-black text-sm text-slate-900 px-2">{qty}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQtyChange(service.id, 1)}
                                                        className="h-7 w-7 bg-[#f95700] hover:bg-[#e04f00] text-white rounded-lg font-black flex items-center justify-center text-xs shadow-2xs transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(service.id, 1)}
                                                    className="rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-[#f95700] text-[#f95700] hover:text-white font-extrabold text-xs px-4 py-2 shadow-2xs transition-all duration-200"
                                                >
                                                    + Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Pickup Address */}
                    <div className="space-y-4" id="step-2-address">
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shadow-sm">2</span>
                            <span>Pickup Address</span>
                        </h2>

                        {addresses.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                                <p className="text-xs text-slate-400 font-bold mb-3">Please save an address to continue.</p>
                                <Link href="/addresses" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm inline-block">
                                    + Add New Address
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {addresses.map((addr) => {
                                    const selected = selectedAddress?.id === addr.id;
                                    return (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() => handleSelectAddress(addr)}
                                            className={`text-left w-full rounded-2xl border p-5 bg-white shadow-sm flex items-start gap-4 transition-all relative ${
                                                selected ? 'border-orange-600 ring-4 ring-orange-500/10' : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className={`inline-flex h-9 w-9 rounded-xl items-center justify-center mt-0.5 ${
                                                selected ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                ⌂
                                            </span>
                                            <div className="space-y-1 pr-6">
                                                <h3 className="font-extrabold text-slate-900 text-sm">{addr.label}</h3>
                                                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Saved Location</p>
                                                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">{addr.postcode}</p>
                                                {addr.directions && (
                                                    <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                                                        "{addr.directions}"
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`absolute right-4 top-5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                                selected ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'
                                            }`}>
                                                {selected && <span className="h-2 w-2 rounded-full bg-white"></span>}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <Link href="/addresses" className="inline-block text-xs font-bold text-orange-600 hover:text-orange-700">
                            + Add New Address
                        </Link>
                    </div>

                    {/* Step 3: Schedule Pickup */}
                    <div className="space-y-4" id="step-3-slot">
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shadow-sm">3</span>
                            <span>Schedule Pickup</span>
                        </h2>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                            
                            {/* Horizontal calendar date picker */}
                            {uniqueDates.length === 0 ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-900 space-y-1">
                                    <p className="text-xs font-bold">⚠️ No Pickup Slots Available For This Area</p>
                                    <p className="text-[11px] text-amber-800 font-medium">
                                        Our pickup service is not yet available for postcode <span className="font-bold uppercase">{selectedAddress?.postcode}</span>. Please choose another saved address or add an address in an active service area.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex gap-2.5 overflow-x-auto pb-1">
                                    {uniqueDates.map((dateString) => {
                                        const { weekday, day } = formatDateLabel(dateString);
                                        const active = selectedDate === dateString;

                                        return (
                                            <button
                                                key={dateString}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDate(dateString);
                                                    setData('time_slot_id', ''); // reset selected window
                                                }}
                                                className={`rounded-2xl border p-3.5 flex flex-col items-center justify-center min-w-[72px] text-center transition-all ${
                                                    active 
                                                        ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-100'
                                                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                                }`}
                                            >
                                                <span className={`text-[10px] font-extrabold uppercase ${active ? 'text-orange-100' : 'text-slate-400'}`}>
                                                    {weekday}
                                                </span>
                                                <span className="text-base font-extrabold mt-1">{day}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Slot windows for selected date */}
                            {selectedDate && (
                                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                                    {slotsForDate.map((slot) => {
                                        const active = data.time_slot_id === slot.id;
                                        const full = slot.capacity <= 0;
                                        const bookedPercent = Math.max(10, Math.min(90, 100 - (slot.capacity * 10)));

                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                disabled={full}
                                                onClick={() => setData('time_slot_id', slot.id)}
                                                className={`text-left w-full rounded-2xl border p-4 transition-all relative ${
                                                    active 
                                                        ? 'bg-orange-50/50 border-orange-600 ring-4 ring-orange-500/10' 
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                } ${full ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            active ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            ⏰
                                                        </span>
                                                        <div>
                                                            <p className="font-extrabold text-sm text-slate-900">{slot.window}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{slot.capacity} slots left</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-extrabold ${active ? 'text-orange-700' : 'text-slate-400'}`}>
                                                        {bookedPercent}% Booked
                                                    </span>
                                                </div>

                                                <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${active ? 'bg-orange-600' : 'bg-slate-400'}`} style={{ width: `${bookedPercent}%` }}></div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary & Placement Details (Enlarged) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                    
                    {/* Order Summary Box */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-2xs space-y-6">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Order Summary</h3>

                        {data.items.length === 0 ? (
                            <p className="text-xs sm:text-sm text-slate-400 font-semibold text-center py-8">
                                Your basket is empty. Please select services on the left.
                            </p>
                        ) : (
                            <div className="space-y-5">
                                {/* Selected Services list */}
                                <div className="divide-y divide-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                                    {data.items.map((item) => {
                                        const s = services.find((srv) => srv.id === item.service_id);
                                        return (
                                            <div key={item.service_id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className="text-slate-900 font-extrabold text-sm sm:text-base">{s?.name}</p>
                                                    <p className="text-slate-400 text-xs font-semibold mt-0.5">{item.qty} x {currencySymbol}{parseFloat(s?.price || 0).toFixed(2)}</p>
                                                </div>
                                                <span className="text-slate-900 font-extrabold text-sm sm:text-base">{currencySymbol}{parseFloat((s?.price || 0) * item.qty).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Estimate details */}
                                {estimating ? (
                                    <p className="text-xs font-bold text-[#f95700] text-center py-2">Calculating total estimates...</p>
                                ) : estimate ? (
                                    <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm font-semibold text-slate-500 space-y-3">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span className="text-slate-900 font-bold">{currencySymbol}{parseFloat(estimate.subtotal).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>VAT</span>
                                            <span className="text-slate-900 font-bold">{currencySymbol}{parseFloat(estimate.vat).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Fee</span>
                                            <span className="text-slate-900 font-bold">{currencySymbol}{parseFloat(estimate.delivery_fee).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-slate-100 text-base">
                                            <span className="text-slate-950 font-extrabold">Total Amount</span>
                                            <span className="text-[#f95700] font-black">{currencySymbol}{parseFloat(estimate.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Payment Method display */}
                                <div className="border border-slate-200/80 bg-slate-50/70 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm font-bold shadow-2xs">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">💳</span>
                                        <div>
                                            <p className="text-slate-900 font-extrabold text-xs sm:text-sm">Payment Method</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Package Credit (Balance: {currencySymbol}142.50)</p>
                                        </div>
                                    </div>
                                    <span className="text-slate-400 font-bold text-sm">›</span>
                                </div>

                                {/* Order Notes input */}
                                <div className="space-y-1.5">
                                    <label htmlFor="note" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                                        Special Note / Instructions
                                    </label>
                                    <textarea
                                        id="note"
                                        rows="2"
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        placeholder="Add notes for collection driver..."
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#f95700] focus:ring-4 focus:ring-orange-100 rounded-xl py-3 px-3.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* User Guidance Notice Box */}
                                {missingMessage ? (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs sm:text-sm font-semibold text-amber-900 flex items-start gap-3 shadow-2xs animate-fade-in">
                                        <span className="text-amber-600 font-bold shrink-0 text-base">💡</span>
                                        <div>
                                            <p className="font-extrabold text-amber-950">Next Step Required:</p>
                                            <p className="mt-0.5 text-amber-800 font-medium">{missingMessage}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2.5 animate-fade-in shadow-2xs">
                                        <span className="text-emerald-600 font-bold text-base">✓</span>
                                        <span>All details complete! Click below to place your order.</span>
                                    </div>
                                )}

                                {/* Server Errors Display */}
                                {(errors.error || errors.address_id || errors.time_slot_id || errors.items || errors.note) && (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm font-semibold text-rose-900 flex items-start gap-2.5 animate-fade-in shadow-2xs">
                                        <span className="text-rose-600 font-bold shrink-0 text-base">✕</span>
                                        <div>
                                            <p className="font-extrabold text-rose-950">Cannot Place Order:</p>
                                            <p className="mt-0.5 text-rose-800 font-medium">
                                                {errors.error || errors.address_id || errors.time_slot_id || errors.items || errors.note}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Place Order Button */}
                                <button
                                    type="button"
                                    onClick={submitOrder}
                                    disabled={processing}
                                    id="btn-place-order"
                                    className={`w-full rounded-2xl text-white font-extrabold py-4 shadow-lg transition-all duration-150 text-sm sm:text-base flex items-center justify-center gap-2 ${
                                        missingMessage 
                                            ? 'bg-[#f95700]/90 hover:bg-[#f95700] shadow-orange-500/20 cursor-pointer' 
                                            : 'bg-[#f95700] hover:bg-[#e04f00] shadow-orange-500/25 hover:scale-[1.01] active:scale-[0.99]'
                                    }`}
                                >
                                    <span>
                                        {processing 
                                            ? 'Placing Order...' 
                                            : missingMessage 
                                            ? missingMessage.replace('Please ', '') 
                                            : 'Place Order →'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* What Happens Next Timeline (Enlarged) */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-2xs space-y-5">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">WHAT HAPPENS NEXT?</h4>
                        <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
                            <div className="relative">
                                <span className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-orange-100 text-[#f95700] flex items-center justify-center text-xs font-bold shadow-2xs">📍</span>
                                <div className="space-y-0.5">
                                    <p className="text-sm sm:text-base font-extrabold text-slate-900">Driver Arrives</p>
                                    <p className="text-xs text-slate-500 font-medium">Collects your laundry bag on time.</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shadow-2xs">⚙</span>
                                <div className="space-y-0.5">
                                    <p className="text-sm sm:text-base font-extrabold text-slate-900">Processing</p>
                                    <p className="text-xs text-slate-500 font-medium">Sanitizing, washing, and folding.</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shadow-2xs">✓</span>
                                <div className="space-y-0.5">
                                    <p className="text-sm sm:text-base font-extrabold text-slate-900">Delivered</p>
                                    <p className="text-xs text-slate-500 font-medium">Fresh items returned to your doorstep.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
