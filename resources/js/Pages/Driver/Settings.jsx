import DriverLayout from '@/Layouts/DriverLayout';

export default function Settings({ driver }) {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-[-0.02em]">Settings</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Your profile and vehicle details.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</span>
                        <p className="text-base font-normal text-slate-800">{driver?.user?.name || '—'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                        <p className="text-base font-normal text-slate-800">{driver?.user?.phone || '—'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</span>
                        <p className="text-base font-normal text-slate-800 capitalize">{driver?.vehicle_type || '—'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Number</span>
                        <p className="text-base font-normal text-slate-800">{driver?.vehicle_number || '—'}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto">
                    <svg className="h-7 w-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h3 className="font-bold text-base text-slate-800">Editable settings coming soon</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                    Contact dispatch to update your profile or vehicle details for now.
                </p>
            </div>
        </div>
    );
}

Settings.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
