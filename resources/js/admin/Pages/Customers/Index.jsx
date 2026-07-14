import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Layout';

export default function Index({ customers, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    function submitSearch(e) {
        e.preventDefault();
        router.get('/admin/customers', search ? { search } : {}, { preserveState: true });
    }

    return (
        <div className="max-w-3xl">
            <h1 className="mb-6 text-2xl font-semibold">Customers</h1>

            <form onSubmit={submitSearch} className="mb-4 flex gap-2">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or email"
                    className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm"
                />
                <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Search</button>
            </form>

            <div className="overflow-hidden rounded bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Orders</th>
                            <th className="px-4 py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.data.map((c) => (
                            <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-2">
                                    <Link href={`/admin/customers/${c.id}`} className="underline">{c.name}</Link>
                                </td>
                                <td className="px-4 py-2">{c.phone}</td>
                                <td className="px-4 py-2">{c.email}</td>
                                <td className="px-4 py-2">{c.orders_count}</td>
                                <td className="px-4 py-2">{c.created_at?.slice(0, 10)}</td>
                            </tr>
                        ))}
                        {customers.data.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No customers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;
