import CustomerLayout from '@/Layouts/CustomerLayout';
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
            <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-3 animate-fade-in">
                {/* Left Side: Order Info & Status Tracker */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400">ORDER TRACKING</span>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">Order #{order.id}</h1>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400">TOTAL PRICE</span>
                            <p className="text-xl font-extrabold text-indigo-600 mt-0.5">{currencySymbol}{parseFloat(order.total).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Active Status Highlight */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-start gap-4">
                        <span className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
                            ⚙
                        </span>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">
                                {STATUS_DETAILS[order.status]?.label || order.status}
                            </h2>
                            <p className="text-sm text-slate-500 font-semibold mt-1">
                                {STATUS_DETAILS[order.status]?.desc}
                            </p>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    {!isCancelled && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                            <h3 className="text-base font-bold text-slate-950">Collection Timeline</h3>
                            <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-3">
                                {STATUS_ORDER.map((status, index) => {
                                    const details = STATUS_DETAILS[status];
                                    const completed = index < currentStatusIndex || order.status === 'delivered';
                                    const active = index === currentStatusIndex && order.status !== 'delivered';

                                    return (
                                        <div key={status} className="relative">
                                            {/* Bullet icon */}
                                            <span
                                                className={`absolute -left-9 top-0.5 h-6 w-6 rounded-full border-4 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                                                    completed
                                                        ? 'bg-emerald-500 border-emerald-100 text-white'
                                                        : active
                                                        ? 'bg-indigo-600 border-indigo-100 text-white'
                                                        : 'bg-white border-slate-200 text-slate-300'
                                                }`}
                                            >
                                                {completed && '✓'}
                                            </span>
                                            <div className="space-y-0.5">
                                                <h4 className={`text-sm font-bold ${active ? 'text-indigo-600' : 'text-slate-900'}`}>
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

                    {/* Cancel Action */}
                    {isCancellable && (
                        <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-6 space-y-4 shadow-sm/50">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-rose-950">Need to cancel your collection?</h3>
                                    <p className="text-xs text-rose-800 font-semibold mt-1">You can cancel your order free-of-charge anytime before our driver collects it.</p>
                                </div>
                                <button
                                    onClick={() => setShowCancelForm(!showCancelForm)}
                                    className="rounded-xl border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm shrink-0"
                                >
                                    {showCancelForm ? 'Close' : 'Cancel Order'}
                                </button>
                            </div>

                            {showCancelForm && (
                                <form onSubmit={submitCancel} className="space-y-3 pt-2">
                                    <label htmlFor="reason" className="block text-xs font-bold text-slate-700">
                                        Reason for cancellation
                                    </label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        required
                                        rows="2"
                                        placeholder="e.g. Need to re-schedule, not home, changed mind..."
                                        value={cancelForm.data.reason}
                                        onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-slate-200 rounded-xl bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-medium"
                                    />
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="submit"
                                            disabled={cancelForm.processing}
                                            id="btn-cancel-order"
                                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 text-xs shadow-sm transition-all"
                                        >
                                            {cancelForm.processing ? 'Cancelling...' : 'Confirm Cancel'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Ratings Feedback Widget (REQ-CUST-11) */}
                    {(isDelivered || isRated) && (
                        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-6 shadow-sm space-y-4">
                            <h3 className="text-base font-bold text-slate-950">Service Feedback</h3>

                            {isRated ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-amber-400 text-lg">
                                        {Array.from({ length: order.rating?.stars || ratingForm.data.stars }).map((_, i) => (
                                            <span key={i}>★</span>
                                        ))}
                                        {Array.from({ length: 5 - (order.rating?.stars || ratingForm.data.stars) }).map((_, i) => (
                                            <span key={i} className="text-slate-200">★</span>
                                        ))}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">
                                        "{order.rating?.comment || 'No comment provided.'}"
                                    </p>
                                    <p className="text-xs text-indigo-700 font-bold">✓ Feedback successfully recorded. Thank you!</p>
                                </div>
                            ) : (
                                <form onSubmit={submitRating} className="space-y-4">
                                    <p className="text-xs text-slate-500 font-semibold">How was your Clean Quick laundry run? Tap a star to submit feedback.</p>
                                    
                                    {/* Stars clicker */}
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                id={`btn-star-${star}`}
                                                onClick={() => ratingForm.setData('stars', star)}
                                                onMouseEnter={() => setRatingHover(star)}
                                                onMouseLeave={() => setRatingHover(0)}
                                                className="text-2xl transition-all duration-100 focus:outline-none"
                                            >
                                                <span className={star <= (ratingHover || ratingForm.data.stars) ? 'text-amber-400' : 'text-slate-200'}>
                                                    ★
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label htmlFor="comment" className="block text-xs font-bold text-slate-700">
                                            Optional comment / review details
                                        </label>
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            rows="2"
                                            placeholder="Write about our cleaning quality, driver pickup, etc..."
                                            value={ratingForm.data.comment}
                                            onChange={(e) => ratingForm.setData('comment', e.target.value)}
                                            className="mt-1.5 appearance-none block w-full px-3 py-2 border border-slate-200 rounded-xl bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={ratingForm.processing}
                                        id="btn-submit-rating"
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm transition-all disabled:opacity-50"
                                    >
                                        {ratingForm.processing ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Invoice & Bag Items Summary */}
                <div className="space-y-4">
                    {/* Basket breakdown */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-950">Basket Items</h3>
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

                        {/* Order breakdown totals */}
                        <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-slate-950 font-bold">{currencySymbol}{parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT</span>
                                <span className="text-slate-950 font-bold">{currencySymbol}{parseFloat(order.vat).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="text-slate-950 font-bold">{currencySymbol}{parseFloat(order.delivery_fee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                                <span className="text-slate-900 font-extrabold">Total Price</span>
                                <span className="text-indigo-600 font-extrabold">{currencySymbol}{parseFloat(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice status card */}
                    {order.invoice && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                            <h3 className="text-base font-bold text-slate-950">Invoice & Billing</h3>
                            <div className="text-xs font-semibold text-slate-600 space-y-2">
                                <div className="flex justify-between">
                                    <span>Invoice Number</span>
                                    <span className="text-slate-950 font-bold">#INV-{order.invoice.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment Mode</span>
                                    <span className="text-slate-950 font-bold uppercase">{order.invoice.method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>VAT Total</span>
                                    <span className="text-slate-950 font-bold">{currencySymbol}{parseFloat(order.invoice.vat).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                                    <span className="text-slate-950 font-extrabold">Payment Status</span>
                                    <span className={`inline-flex rounded-xl border px-2 py-0.5 text-xs font-extrabold uppercase ${
                                        order.invoice.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                                    }`}>
                                        {order.invoice.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
