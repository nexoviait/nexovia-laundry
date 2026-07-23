import { useState } from 'react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function Support({ activeTasks = [], driver }) {
    const [topic, setTopic] = useState('customer_unreachable');
    const [orderId, setOrderId] = useState('');
    const [priority, setPriority] = useState('normal');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    // Initial mock submitted tickets list
    const [tickets, setTickets] = useState([
        {
            id: 'TICK-104',
            topic: 'Customer Unreachable',
            orderRef: '#28',
            priority: 'urgent',
            status: 'in_progress',
            createdAt: 'Today, 11:30 AM',
            message: 'Customer Aisha Begum not answering doorbell for OTP handover. Called twice.',
        },
    ]);

    const [openFaq, setOpenFaq] = useState(null);

    function handleSubmitTicket(e) {
        e.preventDefault();
        if (!message.trim()) return;

        setSubmitting(true);

        setTimeout(() => {
            const newTicket = {
                id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
                topic: topic.replace('_', ' ').toUpperCase(),
                orderRef: orderId ? `#${orderId}` : 'General',
                priority,
                status: 'open',
                createdAt: 'Just now',
                message,
            };

            setTickets([newTicket, ...tickets]);
            setSubmitting(false);
            setSubmittedSuccess(true);
            setMessage('');
            setOrderId('');

            setTimeout(() => setSubmittedSuccess(false), 4000);
        }, 600);
    }

    const faqs = [
        {
            q: "What should I do if a customer isn't answering the door or phone?",
            a: "Wait at the location for 5 minutes. Try calling the customer via the link in the task details. If there is no response, submit a support ticket marked 'Urgent' or contact Dispatch directly before marking the task as failed."
        },
        {
            q: "How is Cash on Delivery (COD) turned over at the end of the shift?",
            a: "All cash collected during deliveries must be handed over to the duty manager at the central hub during shift end sign-off. Ensure your COD summary matches your completed handover tasks."
        },
        {
            q: "What happens if a vehicle experiences a breakdown or fuel issue?",
            a: "Park safely, turn on hazard lights, and press 'Call Dispatch' immediately. Submit a support ticket tagged 'Vehicle / Breakdown' with your exact location."
        },
        {
            q: "How do I report damaged or missing garment items during pickup?",
            a: "Take clear photos of any pre-existing damage during pickup using the task photo uploader. Add an order note detailing the issue so the shop processing team is aware."
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Driver Help Desk</h1>
                <p className="text-sm text-slate-600 font-medium mt-0.5">Need help with an order, your vehicle, or your shift? Contact dispatch or log a ticket.</p>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href="tel:+441212345678"
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs hover:border-orange-300 transition-all flex items-center gap-3.5 group"
                >
                    <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgent Phone Line</p>
                        <p className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">+44 121 234 5678</p>
                        <p className="text-[11px] text-slate-400 font-semibold">Direct line to active dispatch duty manager</p>
                    </div>
                </a>

                <a
                    href="mailto:support@cleanquicklaundry.com"
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs hover:border-orange-300 transition-all flex items-center gap-3.5 group"
                >
                    <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Dispatch</p>
                        <p className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">support@cleanquicklaundry.com</p>
                        <p className="text-[11px] text-slate-400 font-semibold">Response within 15 minutes during shift hours</p>
                    </div>
                </a>
            </div>

            {/* In-App Ticket Submission Form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900">Submit In-App Support Ticket</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Send real-time alerts or assistance requests directly to the dispatch console.</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>

                {submittedSuccess && (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Support ticket submitted! Dispatch has been notified and will respond shortly.</span>
                    </div>
                )}

                <form onSubmit={handleSubmitTicket} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Topic Selector */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Topic / Category</label>
                            <select
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none transition-colors"
                            >
                                <option value="customer_unreachable">Customer Unreachable</option>
                                <option value="address_issue">Incorrect Address / Location</option>
                                <option value="vehicle_breakdown">Vehicle / Breakdown / Fuel</option>
                                <option value="cod_payment_issue">COD / Payment Discrepancy</option>
                                <option value="garment_damage">Damaged or Missing Item</option>
                                <option value="other">Other General Issue</option>
                            </select>
                        </div>

                        {/* Related Order Selector */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Related Order (Optional)</label>
                            <select
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none transition-colors"
                            >
                                <option value="">Select active order...</option>
                                {activeTasks.map(t => (
                                    <option key={t.id} value={t.order?.id}>
                                        Order #{t.order?.id} — {t.order?.user?.name || 'Customer'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority Level */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Priority Level</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none transition-colors"
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Message Details */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Issue Details & Explanation</label>
                        <textarea
                            required
                            rows={3}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Describe what happened, customer interactions, or vehicle status..."
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !message.trim()}
                        className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-3 shadow-2xs disabled:opacity-50 transition-all"
                    >
                        {submitting ? 'Submitting Alert...' : 'Submit Support Ticket'}
                    </button>
                </form>
            </div>

            {/* Submitted Tickets Log */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">Your Recent Tickets</h3>
                <div className="divide-y divide-slate-100 space-y-3">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="pt-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-xs">{ticket.topic}</span>
                                    <span className="text-[10px] font-bold font-mono text-slate-400">{ticket.orderRef}</span>
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                    ticket.status === 'open'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : ticket.status === 'in_progress'
                                        ? 'bg-sky-50 text-sky-800 border-sky-200 animate-pulse'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">{ticket.message}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{ticket.createdAt}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">Frequently Asked Guidelines</h3>
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full p-4 text-left font-bold text-xs text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-colors"
                            >
                                <span>{faq.q}</span>
                                <span className="text-slate-400 font-extrabold text-sm">{openFaq === index ? '−' : '+'}</span>
                            </button>
                            {openFaq === index && (
                                <div className="px-4 pb-4 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-2 bg-white">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

Support.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
