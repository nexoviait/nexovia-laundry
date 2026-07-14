import { useForm } from '@inertiajs/react';
import Layout from '../../Layout';

export default function Edit({ settings }) {
    const { data, setData, put, processing, errors } = useForm({ ...settings });

    function submit(e) {
        e.preventDefault();
        put('/admin/settings');
    }

    return (
        <div className="max-w-xl">
            <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

            <form onSubmit={submit} className="space-y-6 rounded bg-white p-6 shadow-sm">
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Currency & pricing</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <input
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                maxLength={3}
                                className="w-full rounded border border-slate-300 px-3 py-2"
                            />
                            {errors.currency && <p className="text-sm text-red-600">{errors.currency}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">VAT rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.vat_rate}
                                onChange={(e) => setData('vat_rate', e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-2"
                            />
                            {errors.vat_rate && <p className="text-sm text-red-600">{errors.vat_rate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delivery fee ({data.currency})</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.delivery_fee}
                                onChange={(e) => setData('delivery_fee', e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-2"
                            />
                            {errors.delivery_fee && <p className="text-sm text-red-600">{errors.delivery_fee}</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Business profile</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Business name</label>
                            <input
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    value={data.business_phone}
                                    onChange={(e) => setData('business_phone', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    value={data.business_email}
                                    onChange={(e) => setData('business_email', e.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2"
                                />
                                {errors.business_email && <p className="text-sm text-red-600">{errors.business_email}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <textarea
                                value={data.business_address}
                                onChange={(e) => setData('business_address', e.target.value)}
                                rows={2}
                                className="w-full rounded border border-slate-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Opening hours</label>
                            <input
                                value={data.opening_hours}
                                onChange={(e) => setData('opening_hours', e.target.value)}
                                placeholder="Mon-Sat 08:00-18:00"
                                className="w-full rounded border border-slate-300 px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={processing} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
                    Save settings
                </button>
            </form>
        </div>
    );
}

Edit.layout = (page) => <Layout children={page} />;
