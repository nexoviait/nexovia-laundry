import CustomerLayout from '@/Layouts/CustomerLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ addresses }) {
    const [showNewForm, setShowNewForm] = useState(false);
    const [defaultId, setDefaultId] = useState(addresses[0]?.id || null);

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
            <div className="space-y-6 animate-fade-in pb-12">
                {/* Header (Screenshot 2) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Addresses</h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">Manage delivery locations and set your preferred default address.</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowNewForm(!showNewForm);
                            form.clearErrors();
                        }}
                        id="btn-toggle-address-form"
                        className="rounded-2xl bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold px-5 py-3 text-xs shadow-md shadow-orange-500/20 transition-all shrink-0 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                        {showNewForm ? 'Close Form' : '+ Add New Address'}
                    </button>
                </div>

                {/* Add Address Form */}
                {showNewForm && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs animate-fade-in space-y-4">
                        <h2 className="text-base font-extrabold text-slate-900">New Address</h2>
                        <form onSubmit={submit} noValidate className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="label" className="block text-xs font-bold text-slate-700">
                                        Address Name / Label
                                    </label>
                                    <input
                                        id="label"
                                        name="label"
                                        type="text"
                                        required
                                        placeholder="Home, Office, Airbnb #1, etc."
                                        value={form.data.label}
                                        onChange={(e) => form.setData('label', e.target.value)}
                                        className="mt-1.5 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-xs font-semibold transition-all"
                                    />
                                    {form.errors.label && (
                                        <p className="mt-1.5 text-xs text-rose-600 font-bold">{form.errors.label}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="postcode" className="block text-xs font-bold text-slate-700">
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
                                        className="mt-1.5 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-xs font-semibold uppercase transition-all"
                                    />
                                    {form.errors.postcode && (
                                        <p className="mt-1.5 text-xs text-rose-600 font-bold">{form.errors.postcode}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="directions" className="block text-xs font-bold text-slate-700">
                                    Special Access / Delivery Directions
                                </label>
                                <textarea
                                    id="directions"
                                    name="directions"
                                    rows="2"
                                    placeholder="e.g. Leave at front desk, key code 5678"
                                    value={form.data.directions}
                                    onChange={(e) => form.setData('directions', e.target.value)}
                                    className="mt-1.5 appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-xs font-semibold transition-all"
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
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    id="btn-save-address"
                                    className="rounded-xl bg-[#f95700] hover:bg-[#e04f00] text-white font-bold px-5 py-2.5 text-xs shadow-md transition-all disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Addresses Card Grid matching Screenshot 2 */}
                {addresses.length === 0 ? (
                    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs">
                        <span className="inline-flex h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 items-center justify-center font-bold text-lg mb-3 border border-orange-100">
                            ⌂
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900">No saved addresses</h3>
                        <p className="mt-1 text-slate-400 text-xs font-medium">Please add a saved location above to get started with booking laundry runs.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {addresses.map((address) => {
                            const isDefault = defaultId === address.id;

                            return (
                                <div
                                    key={address.id}
                                    className="rounded-3xl bg-slate-200/60 border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col relative group"
                                >
                                    {/* Visual Map Header Texture (Screenshot 2) */}
                                    <div className="h-44 bg-gradient-to-br from-sky-200 via-indigo-100 to-amber-100 relative p-4 flex items-start justify-between">
                                        <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply" fill="none" stroke="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <path d="M0 20 L100 20 M0 50 L100 50 M0 80 L100 80 M20 0 L20 100 M60 0 L60 100" strokeWidth="2" strokeDasharray="4 4" />
                                            <circle cx="60" cy="50" r="8" fill="#f95700" opacity="0.8" />
                                        </svg>
                                        <span className="relative z-10 text-[10px] font-extrabold uppercase bg-white/90 backdrop-blur-sm text-slate-700 px-2.5 py-1 rounded-full border border-slate-200/60 shadow-2xs">
                                            {address.service_area?.name || 'Active Area'}
                                        </span>
                                    </div>

                                    {/* Floating Overlay Content Box (Screenshot 2) */}
                                    <div className="-mt-20 mx-3 mb-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex-1 flex flex-col justify-between space-y-4 relative z-10">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{address.label}</h3>
                                            <p className="text-xs font-bold text-slate-700 leading-snug">
                                                {address.postcode}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                {address.directions || 'Standard home dropoff & pickup location.'}
                                            </p>
                                        </div>

                                        {/* Set as Default Toggle & Actions Bar (Screenshot 2) */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400">Set as Default</span>
                                                <button
                                                    onClick={() => setDefaultId(address.id)}
                                                    className="mt-1 flex items-center gap-1.5 focus:outline-none"
                                                >
                                                    {isDefault ? (
                                                        <div className="h-6 w-11 rounded-full bg-[#f95700] p-0.5 flex items-center justify-end transition-all shadow-xs">
                                                            <span className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[10px] text-[#f95700] font-black">✓</span>
                                                        </div>
                                                    ) : (
                                                        <div className="h-6 w-11 rounded-full bg-slate-200 p-0.5 flex items-center justify-start transition-all">
                                                            <span className="h-5 w-5 rounded-full bg-white shadow-xs"></span>
                                                        </div>
                                                    )}
                                                    <span className="text-[11px] font-bold text-slate-600">
                                                        {isDefault ? 'ON' : 'Off'}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Edit & Delete Controls (Screenshot 2) */}
                                            <div className="flex items-center gap-3 pt-3">
                                                <button
                                                    onClick={() => {
                                                        setShowNewForm(true);
                                                        form.setData({
                                                            label: address.label,
                                                            postcode: address.postcode,
                                                            directions: address.directions || '',
                                                        });
                                                    }}
                                                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                                                    title="Edit address"
                                                >
                                                    ✏ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteAddress(address.id)}
                                                    className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                                                    title="Delete address"
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
