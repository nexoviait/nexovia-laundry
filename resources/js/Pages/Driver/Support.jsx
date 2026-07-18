import DriverLayout from '@/Layouts/DriverLayout';

export default function Support() {
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-[-0.02em]">Support</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Need help with an order, the app, or your shift?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href="tel:+441212345678"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center gap-3"
                >
                    <div className="h-11 w-11 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                        <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-slate-800">Call Dispatch</h3>
                        <p className="text-sm text-slate-400 font-medium">+44 121 234 5678</p>
                    </div>
                </a>

                <a
                    href="mailto:support@cleanquicklaundry.com"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center gap-3"
                >
                    <div className="h-11 w-11 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                        <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-slate-800">Email Support</h3>
                        <p className="text-sm text-slate-400 font-medium">support@cleanquicklaundry.com</p>
                    </div>
                </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto">
                    <svg className="h-7 w-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="font-bold text-base text-slate-800">In-app help desk coming soon</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                    Until then, call or email dispatch above for anything urgent.
                </p>
            </div>
        </div>
    );
}

Support.layout = (page) => (
    <DriverLayout>
        {page}
    </DriverLayout>
);
