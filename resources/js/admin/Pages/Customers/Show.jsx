import { Link } from '@inertiajs/react';
import Layout from '../../Layout';

export default function Show({ customer, addresses, orders }) {
    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl font-semibold">{customer.name}</h1>
            <div className="rounded bg-white p-5 shadow-sm text-sm">
                <p>Phone: {customer.phone}</p>
                <p>Email: {customer.email}</p>
                <p>Joined: {customer.created_at?.slice(0, 10)}</p>
            </div>

            <div className="rounded bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Addresses</h2>
                <ul className="space-y-1 text-sm">
                    {addresses.map((a) => (
                        <li key={a.id}>{a.label} — {a.postcode} ({a.service_area?.name})</li>
                    ))}
                    {addresses.length === 0 && <li className="text-slate-400">No saved addresses.</li>}
                </ul>
            </div>

            <div className="rounded bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent orders</h2>
                <ul className="space-y-1 text-sm">
                    {orders.map((o) => (
                        <li key={o.id}>
                            <Link href={`/admin/orders/${o.id}`} className="underline">#{o.id}</Link> — {o.status} — £{o.total}
                        </li>
                    ))}
                    {orders.length === 0 && <li className="text-slate-400">No orders yet.</li>}
                </ul>
            </div>
        </div>
    );
}

Show.layout = (page) => <Layout children={page} />;
