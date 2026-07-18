import CustomerLayout from '@/Layouts/CustomerLayout';
import { useForm, usePage, Link } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

// Service icons helper
const SERVICE_ICONS = {
    Shirt: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    Trousers: (
        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Bedsheet: (
        <svg className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    default: (
        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    )
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
                const response = await axios.post('/book/estimate', { items: data.items });
                setEstimate(response.data);
            } catch (err) {
                console.error('Pricing estimate error:', err);
            } finally {
                setEstimating(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [data.items]);

    function submitOrder(e) {
        e.preventDefault();
        post('/book');
    }

    return (
        <CustomerLayout>
            <div className="grid gap-8 lg:grid-cols-3 items-start">
                
                {/* Left Column: 3 Wizard Steps */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Welcome Banner */}
                    <div className="rounded-3xl bg-blue-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl shadow-blue-200">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {customerName}</h1>
                            <p className="mt-1.5 text-blue-100 text-sm font-semibold">Ready for a fresh start today?</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/10">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Package Balance</span>
                                <div className="text-xl font-extrabold mt-0.5">{currencySymbol}142.50</div>
                            </div>
                            <button type="button" className="bg-white text-blue-600 font-extrabold text-xs px-3 py-2 rounded-xl shadow-sm hover:bg-blue-50 transition-all">
                                Top Up
                            </button>
                        </div>
                    </div>

                    {/* Step 1: Select Services */}
                    <div className="space-y-4">
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                            <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <span>Select Services</span>
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {services.map((service) => {
                                const qty = data.items.find((i) => i.service_id === service.id)?.qty || 0;
                                const icon = SERVICE_ICONS[service.name] || SERVICE_ICONS.default;

                                return (
                                    <div
                                        key={service.id}
                                        className={`rounded-2xl border bg-white p-4 shadow-sm flex flex-col justify-between h-48 transition-all ${
                                            qty > 0 ? 'border-blue-600 ring-2 ring-blue-50' : 'border-slate-200'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <span className="inline-flex h-9 w-9 rounded-xl bg-blue-50 items-center justify-center">
                                                {icon}
                                            </span>
                                            <h3 className="font-extrabold text-slate-900 text-sm">{service.name}</h3>
                                            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                                Professional standard cleaning per {service.unit}.
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xs font-extrabold text-slate-700">{currencySymbol}{parseFloat(service.price).toFixed(2)}/{service.unit}</span>
                                            
                                            {qty > 0 ? (
                                                <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-1 border border-blue-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQtyChange(service.id, -1)}
                                                        className="h-6 w-6 bg-white rounded-lg font-bold text-blue-600 flex items-center justify-center text-xs"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-xs text-slate-800 px-1">{qty}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQtyChange(service.id, 1)}
                                                        className="h-6 w-6 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center text-xs"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(service.id, 1)}
                                                    className="rounded-xl border border-slate-200 hover:border-blue-600 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Pickup Address */}
                    <div className="space-y-4">
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                            <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                            <span>Pickup Address</span>
                        </h2>

                        {addresses.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                                <p className="text-xs text-slate-400 font-bold mb-3">Please save an address to continue.</p>
                                <Link href="/addresses" className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold shadow-sm">
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
                                                selected ? 'border-blue-600 ring-2 ring-blue-50' : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <span className="inline-flex h-9 w-9 rounded-xl bg-slate-100 items-center justify-center text-slate-500 mt-0.5">
                                                ⌂
                                            </span>
                                            <div className="space-y-1 pr-6">
                                                <h3 className="font-extrabold text-slate-900 text-sm">{addr.label}</h3>
                                                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Saved Address</p>
                                                <p className="text-xs text-slate-400 font-semibold uppercase">{addr.postcode}</p>
                                                {addr.directions && (
                                                    <p className="text-[10px] text-slate-400 font-medium italic mt-1 font-mono">
                                                        "{addr.directions}"
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`absolute right-4 top-5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                                selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                            }`}>
                                                {selected && <span className="h-2 w-2 rounded-full bg-white"></span>}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <Link href="/addresses" className="inline-block text-xs font-bold text-blue-600 hover:text-blue-700">
                            + Add New Address
                        </Link>
                    </div>

                    {/* Step 3: Schedule Pickup */}
                    <div className="space-y-4">
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                            <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                            <span>Schedule Pickup</span>
                        </h2>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
                            
                            {/* Horizontal calendar date picker */}
                            {uniqueDates.length === 0 ? (
                                <p className="text-xs text-slate-400 font-semibold text-center">No time slot dates available for this area.</p>
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
                                                className={`rounded-2xl border p-3.5 flex flex-col items-center justify-center min-w-[70px] text-center transition-all ${
                                                    active 
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                                                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                                }`}
                                            >
                                                <span className={`text-[10px] font-extrabold ${active ? 'text-blue-100' : 'text-slate-400'}`}>
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
                                        // Fake progress bar capacity
                                        const bookedPercent = Math.max(10, Math.min(90, 100 - (slot.capacity * 10)));

                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                disabled={full}
                                                onClick={() => setData('time_slot_id', slot.id)}
                                                className={`text-left w-full rounded-2xl border p-4 transition-all relative ${
                                                    active 
                                                        ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-50' 
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                } ${full ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                            active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            ⏰
                                                        </span>
                                                        <div>
                                                            <p className="font-extrabold text-sm text-slate-900">{slot.window}</p>
                                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{slot.capacity} slots left</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-extrabold ${active ? 'text-blue-700' : 'text-slate-400'}`}>
                                                        {bookedPercent}% Booked
                                                    </span>
                                                </div>

                                                <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${active ? 'bg-blue-600' : 'bg-slate-400'}`} style={{ width: `${bookedPercent}%` }}></div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary & Placement Details (1 column) */}
                <div className="space-y-6 lg:sticky lg:top-24">
                    
                    {/* Order Summary box */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <h3 className="text-base font-extrabold text-slate-950 tracking-tight">Order Summary</h3>

                        {data.items.length === 0 ? (
                            <p className="text-xs text-slate-400 font-semibold text-center py-6">Your basket is empty. Please select services on the left.</p>
                        ) : (
                            <div className="space-y-4">
                                {/* Selected Services list */}
                                <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                                    {data.items.map((item) => {
                                        const s = services.find((srv) => srv.id === item.service_id);
                                        return (
                                            <div key={item.service_id} className="py-2.5 flex justify-between items-center">
                                                <div>
                                                    <p className="text-slate-900 font-bold">{s.name}</p>
                                                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{item.qty} x {currencySymbol}{parseFloat(s.price).toFixed(2)}</p>
                                                </div>
                                                <span className="text-slate-900 font-bold">{currencySymbol}{parseFloat(s.price * item.qty).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Estimate details */}
                                {estimating ? (
                                    <p className="text-xs text-indigo-600 font-bold text-center py-2">Calculating total estimates...</p>
                                ) : estimate ? (
                                    <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 space-y-3">
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
                                        <div className="flex justify-between pt-3 border-t border-slate-100 text-sm">
                                            <span className="text-slate-950 font-extrabold">Total Amount</span>
                                            <span className="text-blue-600 font-extrabold">{currencySymbol}{parseFloat(estimate.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Payment Method display */}
                                <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between text-xs font-bold">
                                    <div className="flex items-center gap-2.5">
                                        <span>💳</span>
                                        <div>
                                            <p className="text-slate-900 font-extrabold">Payment Method</p>
                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Package Credit (Balance: {currencySymbol}142.50)</p>
                                        </div>
                                    </div>
                                    <span className="text-slate-400">›</span>
                                </div>

                                {/* Order Notes input */}
                                <div className="space-y-1.5">
                                    <label htmlFor="note" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Special Note / Instructions
                                    </label>
                                    <textarea
                                        id="note"
                                        rows="2"
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        placeholder="Add notes for collection driver..."
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
                                    />
                                    {errors.note && <p className="text-xs text-rose-600 font-bold mt-1">{errors.note}</p>}
                                    {errors.address_id && <p className="text-xs text-rose-600 font-bold mt-1">Please select an address.</p>}
                                    {errors.time_slot_id && <p className="text-xs text-rose-600 font-bold mt-1">Please choose a pickup slot.</p>}
                                </div>

                                {/* Place Order Button */}
                                <button
                                    type="button"
                                    onClick={submitOrder}
                                    disabled={processing || data.items.length === 0 || !data.address_id || !data.time_slot_id}
                                    id="btn-place-order"
                                    className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 shadow-lg shadow-blue-200 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                                >
                                    <span>Place Order</span>
                                    <span>→</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* What happens next timeline */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">What Happens Next?</h4>
                        <div className="relative border-l border-slate-100 pl-5 space-y-5 ml-2.5">
                            <div className="relative">
                                <span className="absolute -left-7 top-0.5 h-4.5 w-4.5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">📍</span>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-900">Driver Arrives</p>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Collects your laundry bag on time.</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-7 top-0.5 h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">⚙</span>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-900">Processing</p>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sanitizing, washing, and folding.</p>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-7 top-0.5 h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">✓</span>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-900">Delivered</p>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Fresh items returned to your doorstep.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </CustomerLayout>
    );
}
