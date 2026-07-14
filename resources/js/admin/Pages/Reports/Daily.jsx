import { router } from '@inertiajs/react';
import Layout from '../../Layout';

export default function Daily({ date, summary, orders }) {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Daily report</h1>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => router.get('/admin/reports/daily', { date: e.target.value })}
                        className="rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                    <a
                        href={`/admin/reports/daily/export?date=${date}`}
                        className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                    >
                        Export CSV
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase text-slate-400">Total orders</div>
                    <div className="text-2xl font-semibold">{summary.total_orders}</div>
                </div>
                <div className="rounded bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase text-slate-400">Revenue</div>
                    <div className="text-2xl font-semibold">£{summary.revenue.toFixed(2)}</div>
                </div>
                <div className="rounded bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase text-slate-400">Cancelled</div>
                    <div className="text-2xl font-semibold">{summary.cancelled}</div>
                </div>
            </div>

            <div className="rounded bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">By status</h2>
                <div className="flex flex-wrap gap-2 text-sm">
                    {Object.entries(summary.by_status).map(([status, count]) => (
                        <span key={status} className="rounded-full bg-slate-100 px-3 py-1">
                            {status}: {count}
                        </span>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Area</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id} className="border-t border-slate-100">
                                <td className="px-4 py-2">#{o.id}</td>
                                <td className="px-4 py-2">{o.user?.name}</td>
                                <td className="px-4 py-2">{o.address?.service_area?.name}</td>
                                <td className="px-4 py-2">{o.status}</td>
                                <td className="px-4 py-2">£{o.total}</td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No orders on this date.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Daily.layout = (page) => <Layout children={page} />;
