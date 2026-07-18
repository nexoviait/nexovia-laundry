import DriverLayout from '@/Layouts/DriverLayout';

export default function OtpHandover() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-[-0.02em]">OTP Handover</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Verify delivery handover codes in one place.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto">
                    <svg className="h-7 w-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 11-12 0 6 6 0 0112 0zM3 21l6.5-6.5" />
                    </svg>
                </div>
                <h3 className="font-bold text-base text-slate-800">Coming Soon</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                    A dedicated OTP handover view is on the way. For now, enter the delivery code from within each task's detail page.
                </p>
            </div>
        </div>
    );
}

OtpHandover.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
