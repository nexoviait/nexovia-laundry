import DriverLayout from '@/Layouts/DriverLayout';

export default function LiveQueue() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-[-0.02em]">Live Task Queue</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Real-time view of tasks as they're dispatched to you.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto">
                    <svg className="h-7 w-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </div>
                <h3 className="font-bold text-base text-slate-800">Coming Soon</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                    Live task queue tracking is on the way. For now, check <span className="font-bold text-slate-600">Today's Runs</span> for your active tasks.
                </p>
            </div>
        </div>
    );
}

LiveQueue.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
