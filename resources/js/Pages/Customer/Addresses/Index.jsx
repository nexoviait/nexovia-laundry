import CustomerLayout from '@/Layouts/CustomerLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ addresses }) {
    const [showNewForm, setShowNewForm] = useState(false);

    const form = useForm({
        label: 'Home',
        postcode: '',
        directions: '',
    });

    function submit(e) {
        e.preventDefault();
        form.post('/addresses', {
            onSuccess: () => {
                form.reset();
                setShowNewForm(false);
            },
        });
    }

    function deleteAddress(id) {
        if (confirm('Are you sure you want to delete this address?')) {
            form.delete(`/addresses/${id}`);
        }
    }

    return (
        <CustomerLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Addresses</h1>
                        <p className="text-sm text-slate-500 font-semibold mt-1">Manage delivery locations. All addresses must fall inside our active service areas.</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowNewForm(!showNewForm);
                            form.clearErrors();
                        }}
                        id="btn-toggle-address-form"
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-sm shadow-sm transition-all shrink-0"
                    >
                        {showNewForm ? 'Close Form' : '+ Add Address'}
                    </button>
                </div>

                {/* Add Address Form */}
                {showNewForm && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">New Address</h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="label" className="block text-sm font-semibold text-slate-700">
                                        Address Name/Label
                                    </label>
                                    <input
                                        id="label"
                                        name="label"
                                        type="text"
                                        required
                                        placeholder="Home, Office, Airbnb, etc."
                                        value={form.data.label}
                                        onChange={(e) => form.setData('label', e.target.value)}
                                        className="mt-1.5 appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold transition-all"
                                    />
                                    {form.errors.label && (
                                        <p className="mt-1.5 text-xs text-rose-600 font-bold">{form.errors.label}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="postcode" className="block text-sm font-semibold text-slate-700">
                                        Postcode
                                    </label>
                                    <input
                                        id="postcode"
                                        name="postcode"
                                        type="text"
                                        required
                                        placeholder="B19 3AB"
                                        value={form.data.postcode}
                                        onChange={(e) => form.setData('postcode', e.target.value)}
                                        className="mt-1.5 appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold uppercase transition-all"
                                    />
                                    {form.errors.postcode && (
                                        <p className="mt-1.5 text-xs text-rose-600 font-bold">{form.errors.postcode}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="directions" className="block text-sm font-semibold text-slate-700">
                                    Special Access / Delivery Directions
                                </label>
                                <textarea
                                    id="directions"
                                    name="directions"
                                    rows="2"
                                    placeholder="e.g. Ground floor flat, blue door, ring bell twice"
                                    value={form.data.directions}
                                    onChange={(e) => form.setData('directions', e.target.value)}
                                    className="mt-1.5 appearance-none block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold transition-all"
                                />
                                {form.errors.directions && (
                                    <p className="mt-1.5 text-xs text-rose-600 font-bold">{form.errors.directions}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewForm(false);
                                        form.reset();
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    id="btn-save-address"
                                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 text-sm shadow-sm transition-all disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Addresses List */}
                {addresses.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                        <span className="inline-flex h-12 w-12 rounded-2xl bg-slate-50 items-center justify-center text-slate-400 font-bold text-lg mb-4">
                            ⌂
                        </span>
                        <h3 className="text-sm font-bold text-slate-950">No saved addresses</h3>
                        <p className="mt-1 text-slate-500 text-xs font-semibold">Please add a saved location above to get started with booking laundry runs.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-slate-900">{address.label}</h3>
                                        <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                            {address.service_area?.name}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">{address.postcode}</p>
                                    {address.directions && (
                                        <p className="text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                            {address.directions}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => deleteAddress(address.id)}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                                    >
                                        Delete Address
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
