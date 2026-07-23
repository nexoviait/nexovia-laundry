import { useForm } from '@inertiajs/react';
import DriverLayout from '@/Layouts/DriverLayout';

export default function Settings({ driver }) {
    const form = useForm({
        name: driver?.user?.name || '',
        phone: driver?.user?.phone || '',
        vehicle_type: driver?.vehicle_type || 'Van',
        vehicle_number: driver?.vehicle_number || '',
        active: driver?.active !== false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.put('/driver/settings', {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Driver Account Settings</h1>
                <p className="text-sm text-slate-600 font-semibold mt-1">Manage your driver profile, contact details, vehicle specifications, and on-duty availability.</p>
            </div>

            {/* Editable Profile & Vehicle Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                
                {/* On-Duty Availability Toggle Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 ${
                            form.data.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                            {form.data.active ? '🟢' : '⏸️'}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-slate-900">Duty Availability</h3>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                {form.data.active ? 'Online — Ready to accept pickup & delivery dispatches' : 'Offline — Duty paused'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => form.setData('active', !form.data.active)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            form.data.active ? 'bg-orange-600' : 'bg-slate-300'
                        }`}
                    >
                        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            form.data.active ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                </div>

                {/* Personal Information */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Personal Profile</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none"
                            />
                            {form.errors.name && <p className="text-[10px] text-rose-600 font-bold">{form.errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                required
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none"
                            />
                            {form.errors.phone && <p className="text-[10px] text-rose-600 font-bold">{form.errors.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Vehicle & Logistics Details */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Vehicle & Logistics</h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Vehicle Type</label>
                            <select
                                value={form.data.vehicle_type}
                                onChange={(e) => form.setData('vehicle_type', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                            >
                                <option value="Van">Van / Cargo Van</option>
                                <option value="Motorbike">Motorbike / Express Courier</option>
                                <option value="Bicycle">Bicycle / E-Bike</option>
                                <option value="Car">Passenger Car</option>
                            </select>
                            {form.errors.vehicle_type && <p className="text-[10px] text-rose-600 font-bold">{form.errors.vehicle_type}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Vehicle Registration / Plate Number</label>
                            <input
                                type="text"
                                required
                                value={form.data.vehicle_number}
                                onChange={(e) => form.setData('vehicle_number', e.target.value)}
                                placeholder="e.g. CQ21 VAN"
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 uppercase focus:outline-none"
                            />
                            {form.errors.vehicle_number && <p className="text-[10px] text-rose-600 font-bold">{form.errors.vehicle_number}</p>}
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {form.processing ? 'Saving Settings...' : 'Save Driver Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}

Settings.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
