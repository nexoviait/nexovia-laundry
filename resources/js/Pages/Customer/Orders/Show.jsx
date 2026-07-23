import CustomerLayout from '@/Layouts/CustomerLayout';
import LiveOrderMap from '@/Components/LiveOrderMap';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_ORDER = [
    'pending',
    'confirmed',
    'assigned',
    'picked_up',
    'processing',
    'ready',
    'out_for_delivery',
    'delivered',
];

const STATUS_DETAILS = {
    pending: { label: 'Awaiting Confirmation', desc: 'We received your order and are confirming booking availability.' },
    confirmed: { label: 'Confirmed', desc: 'Your laundry run is confirmed. We are scheduling a collection run.' },
    assigned: { label: 'Driver Assigned', desc: 'A collection driver has been assigned to your order.' },
    picked_up: { label: 'Items Collected', desc: 'The driver collected your laundry bag and is heading back.' },
    processing: { label: 'Washing & Cleaning', desc: 'Your clothes are individually QR-tagged and running through processing stages.' },
    ready: { label: 'Ready for Dispatch', desc: 'Cleaning and QC inspection are complete. Invoice is ready!' },
    out_for_delivery: { label: 'Out for Delivery', desc: 'A driver is heading to your address with your fresh clothes.' },
    delivered: { label: 'Delivered', desc: 'Order delivered successfully. Thank you!' },
    rated: { label: 'Completed & Rated', desc: 'Your feedback was logged. Thank you!' },
    cancelled: { label: 'Cancelled', desc: 'This order has been cancelled.' },
};

export default function Show({ order }) {
    const { props } = usePage();
    const currency = props.settings?.currency || 'GBP';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

    const [ratingHover, setRatingHover] = useState(0);
    const [showCancelForm, setShowCancelForm] = useState(false);

    const cancelForm = useForm({
        reason: '',
    });

    const ratingForm = useForm({
        stars: 5,
        comment: '',
    });

    function submitCancel(e) {
        e.preventDefault();
        cancelForm.post(`/orders/${order.id}/cancel`, {
            onSuccess: () => setShowCancelForm(false),
        });
    }

    function submitRating(e) {
        e.preventDefault();
        ratingForm.post(`/orders/${order.id}/rate`);
    }

    const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';
    const isRated = order.status === 'rated' || order.rating !== null;
    const isDelivered = order.status === 'delivered';
    const isCancellable = ['pending', 'confirmed', 'assigned'].includes(order.status);

    return (
        <CustomerLayout>
            <div className="space-y-6 animate-fade-in pb-12">
                {/* Header (Screenshot 3) */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Order #{order.id}
                            </h1>
                            <span className="rounded-full bg-emerald-600 text-white font-extrabold px-3 py-1 text-xs shadow-xs">
                                {STATUS_DETAILS[order.status]?.label || order.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Real-time driver location and delivery schedule</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL PRICE</span>
                        <p className="text-xl font-extrabold text-orange-600 mt-0.5">{currencySymbol}{parseFloat(order.total).toFixed(2)}</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 items-start">
                    {/* Left 2 Cols: Live Route Map Canvas (Screenshot 3) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden relative">
                            {/* Vector Map Canvas */}
                            <div className="h-80 sm:h-96 bg-[#e2e8f0] relative overflow-hidden flex items-center justify-center">
                                {/* Streets Vector Graphic */}
                                <svg className="absolute inset-0 w-full h-full text-slate-300" stroke="currentColor" fill="none">
                                    <rect width="100%" height="100%" fill="#e0f2fe" />
                                    <path d="M0 60 Q 150 40, 300 80 T 600 60" stroke="#cbd5e1" strokeWidth="24" fill="none" />
                                    <path d="M50 0 L 120 400 M 350 0 L 280 400 M 500 0 L 520 400" stroke="#ffffff" strokeWidth="18" fill="none" />
                                    <path d="M0 180 L 700 160 M 0 300 L 700 320" stroke="#ffffff" strokeWidth="16" fill="none" />

                                    {/* Green Parks */}
                                    <path d="M40 80 Q 90 60, 140 100 T 220 120 Z" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2" />
                                    <path d="M420 200 Q 480 180, 520 220 T 600 240 Z" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2" />

                                    {/* Blue Route Line */}
                                    <path d="M 120 180 Q 250 280, 480 180 T 520 160" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 6" fill="none" className="animate-pulse" />
                                </svg>

                                {/* Driver Van Marker (Screenshot 3) */}
                                <div className="absolute top-28 left-24 sm:left-36 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-lg flex items-center gap-2 z-20">
                                    <div className="h-8 w-8 rounded-xl bg-sky-600 text-white flex items-center justify-center text-sm font-bold">
                                        🚚
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-extrabold text-slate-900 leading-tight">Driver: Sarah M.</p>
                                        <p className="text-[10px] font-bold text-sky-700">ETA: 12 min</p>
                                    </div>
                                </div>

                                {/* Customer Location House Pin Marker (Screenshot 3) */}
                                <div className="absolute bottom-16 right-12 sm:right-24 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-lg flex items-center gap-2 z-20">
                                    <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                                        🏠
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-extrabold text-slate-900 leading-tight">Your Location:</p>
                                        <p className="text-[10px] font-semibold text-slate-600">{order.address?.postcode || '123 Maple Street'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live GPS Tracking Map Card */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">Live Driver Tracking Map</h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Real-time driver location and courier progress</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                                    LIVE GPS
                                </span>
                            </div>
                            <LiveOrderMap
                                height="280px"
                                drivers={[
                                    {
                                        id: 1,
                                        name: 'Sarah M.',
                                        vehicle_type: 'Express Van',
                                        vehicle_number: 'LN-26-YTR',
                                        current_lat: 52.4875,
                                        current_lng: -1.8920,
                                        tasks_count: 1,
                                        active_tasks: [
                                            {
                                                id: order.id,
                                                order_id: order.id,
                                                order_status: order.status,
                                                customer_name: order.user?.name || 'You',
                                                postcode: order.address?.postcode || 'B19',
                                                lat: 52.4930,
                                                lng: -1.8980,
                                            }
                                        ]
                                    }
                                ]}
                            />
                        </div>

                        {/* Progress Timeline */}
                        {!isCancelled && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
                                <h3 className="text-base font-extrabold text-slate-900">Collection Timeline</h3>
                                <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
                                    {STATUS_ORDER.map((status, index) => {
                                        const details = STATUS_DETAILS[status];
                                        const completed = index < currentStatusIndex || order.status === 'delivered';
                                        const active = index === currentStatusIndex && order.status !== 'delivered';

                                        return (
                                            <div key={status} className="relative">
                                                <span
                                                    className={`absolute -left-9 top-0.5 h-6 w-6 rounded-full border-4 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                                                        completed
                                                            ? 'bg-emerald-500 border-emerald-100 text-white'
                                                            : active
                                                            ? 'bg-orange-600 border-orange-100 text-white'
                                                            : 'bg-white border-slate-200 text-slate-300'
                                                    }`}
                                                >
                                                    {completed && '✓'}
                                                </span>
                                                <div className="space-y-0.5">
                                                    <h4 className={`text-xs font-bold ${active ? 'text-orange-600' : 'text-slate-900'}`}>
                                                        {details.label}
                                                    </h4>
                                                    {active && (
                                                        <p className="text-xs text-slate-500 font-semibold">{details.desc}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Driver Contact Card & Delivery OTP Box (Screenshot 3) */}
                    <div className="space-y-6">
                        {/* Driver Profile Card (Screenshot 3) */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl overflow-hidden font-bold text-slate-700">
                                        👩‍✈️
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                            Sarah M.
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                4.9 ★
                                            </span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-semibold">Assigned Clean Quick Courier</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => alert('Dialing assigned courier: +44 7700 900077')}
                                className="w-full rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold py-3 text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                📞 Call Driver
                            </button>
                        </div>

                        {/* Delivery OTP Verification Box (Screenshot 3) */}
                        <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 text-white p-6 shadow-md text-center space-y-3">
                            <h4 className="text-xs font-extrabold tracking-wider uppercase opacity-90">
                                Your OTP for Delivery Completion
                            </h4>
                            <div className="bg-white text-blue-900 rounded-2xl py-4 text-4xl font-black tracking-widest shadow-inner mx-auto max-w-[200px]">
                                {order.delivery_otp || '4291'}
                            </div>
                            <p className="text-[11px] font-semibold text-blue-100 leading-relaxed max-w-xs mx-auto">
                                Please provide this code to the driver upon arrival.
                            </p>
                        </div>

                        {/* Order Basket Summary */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900">Order Summary ({order.items?.length || 0} Items)</h3>
                            <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="py-2.5 flex justify-between items-center">
                                        <div>
                                            <p className="text-slate-950 font-bold">{item.service?.name}</p>
                                            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{currencySymbol}{parseFloat(item.unit_price).toFixed(2)} each</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-950 font-bold">x{item.qty}</p>
                                            <p className="text-slate-950 font-extrabold mt-0.5">{currencySymbol}{parseFloat(item.line_total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Star Rating & One-Tap Google Review Prompt */}
                        {(order.status === 'delivered' || order.status === 'rated' || isRated) && (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-2xs space-y-4 text-center">
                                <h4 className="text-sm font-extrabold text-amber-950">
                                    {isRated ? 'Thank you for your rating! ⭐' : 'How was your laundry service?'}
                                </h4>
                                
                                {!isRated ? (
                                    <form onSubmit={submitRating} className="space-y-3">
                                        <div className="flex justify-center gap-2 text-2xl">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => ratingForm.setData('stars', star)}
                                                    onMouseEnter={() => setRatingHover(star)}
                                                    onMouseLeave={() => setRatingHover(0)}
                                                    className="transition-transform hover:scale-125 focus:outline-none"
                                                >
                                                    {(ratingHover || ratingForm.data.stars) >= star ? '⭐' : '☆'}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="Write your feedback..."
                                            value={ratingForm.data.comment}
                                            onChange={(e) => ratingForm.setData('comment', e.target.value)}
                                            className="w-full rounded-2xl border border-amber-200 bg-white p-3 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={ratingForm.processing}
                                            className="w-full rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 text-xs shadow-sm transition-all"
                                        >
                                            Submit Rating
                                        </button>
                                    </form>
                                ) : (
                                    <p className="text-xs text-amber-800 font-bold">
                                        You rated this order {order.rating?.stars || 5} Stars!
                                    </p>
                                )}

                                {/* One-Tap Google Review Prompt */}
                                <div className="pt-3 border-t border-amber-200/80 space-y-2">
                                    <p className="text-[11px] font-semibold text-amber-900">
                                        Love Clean Quick Laundry? Share your review on Google!
                                    </p>
                                    <a
                                        href={props.settings?.google_review_url || "https://g.page/r/clean-quick-laundry/review"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-extrabold py-3 text-xs shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                                    >
                                        <span className="text-base font-black text-blue-600">G</span>
                                        <span>⭐ One-Tap Google Review Prompt</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
