import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function DriverLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });
    const [remember, setRemember] = useState(true);

    function submit(e) {
        e.preventDefault();
        post('/driver/login');
    }

    return (
        <div className="driver-portal min-h-screen flex font-sans">
            {/* Left Panel */}
            <div
                className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60"
            >
                <div className="relative z-10 max-w-md flex flex-col items-center text-center">
                    {/* Photo card */}
                    <div className="mb-10 w-72 bg-white rounded-[28px] border border-slate-100 shadow-2xl shadow-slate-200/70 p-3 -rotate-1">
                        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 aspect-[4/3] flex items-center justify-center relative">
                            <svg viewBox="0 0 300 220" className="w-full h-full text-slate-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="300" height="220" fill="#e2e8f0" />
                                <rect x="0" y="175" width="300" height="45" fill="#cbd5e1" />
                                <rect x="0" y="182" width="300" height="4" fill="#94a3b8" opacity="0.4" />
                                <rect x="30" y="90" width="200" height="85" rx="10" stroke="#475569" strokeWidth="3" fill="#f8fafc" />
                                <rect x="30" y="90" width="200" height="14" fill="#f97316" />
                                <path d="M170 90 L170 65 Q170 54 181 54 L208 54 Q221 54 227 65 L230 90 Z" stroke="#475569" strokeWidth="3" fill="#f1f5f9" />
                                <path d="M176 88 L176 68 Q176 61 183 61 L206 61 Q212 61 221 68 L224 88 Z" fill="#bae6fd" opacity="0.7" />
                                <rect x="45" y="105" width="55" height="26" rx="5" fill="#e0f2fe" stroke="#94a3b8" strokeWidth="1.5" />
                                <rect x="110" y="105" width="50" height="26" rx="5" fill="#e0f2fe" stroke="#94a3b8" strokeWidth="1.5" />
                                <text x="130" y="150" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11" fill="#f97316" textAnchor="middle">SwiftClean</text>
                                <text x="130" y="161" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="7" fill="#64748b" textAnchor="middle">LOGISTICS</text>
                                <circle cx="80" cy="178" r="17" fill="#334155" />
                                <circle cx="80" cy="178" r="8" fill="#94a3b8" />
                                <circle cx="200" cy="178" r="17" fill="#334155" />
                                <circle cx="200" cy="178" r="8" fill="#94a3b8" />
                            </svg>
                        </div>
                        <div className="pt-4 pb-2 flex flex-col items-center gap-2.5">
                            <p className="font-semibold text-slate-900 text-base">Clean Quick Laundry</p>
                            <span className="inline-flex rounded-full bg-orange-600 px-3.5 py-1 text-[11px] font-bold text-white uppercase tracking-widest">
                                Driver Portal
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-semibold text-slate-900 tracking-[-0.02em] leading-tight">
                        Precision in Every Pick-up.
                    </h1>
                    <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-sm">
                        Sign in to view your dispatch tasks, confirm pickups, and complete deliveries — all from one high-performance interface.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-2.5 mt-6">
                        {['Today\'s Runs', 'Live Queue', 'OTP Secure'].map(f => (
                            <span key={f} className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Login form */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-10 bg-white">
                <div className="w-full max-w-sm">
                    {/* Mobile brand */}
                    <div className="md:hidden flex items-center gap-3.5 mb-8">
                        <span className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </span>
                        <div>
                            <h2 className="font-semibold text-lg text-slate-900 leading-tight">Clean Quick Laundry</h2>
                            <p className="text-xs text-slate-400 font-medium">Driver Sign In</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Driver Sign In</h1>
                        <p className="mt-1.5 text-slate-400 text-sm">
                            Secure access for authorized personnel only
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Driver ID / Email Address
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    id="driver-email"
                                    type="email"
                                    autoFocus
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="driver@cleanquicklaundry.com"
                                    className={`w-full rounded-xl border ${
                                        errors.email
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                                    } pl-10 pr-4 py-3 text-sm text-slate-800 transition-all focus:outline-none focus:ring-4 focus:bg-white bg-slate-50`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                                    Forgot Password?
                                </a>
                            </div>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    id="driver-password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full rounded-xl border ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                                    } pl-10 pr-4 py-3 text-sm text-slate-800 transition-all focus:outline-none focus:ring-4 focus:bg-white bg-slate-50`}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-200"
                            />
                            <span className="text-xs text-slate-500">Remember this device for 24 hours</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            id="btn-driver-login"
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] px-4 py-3.5 text-sm text-white shadow-lg shadow-orange-100 hover:shadow-xl hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Sign In to Driver Portal
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-5 text-xs font-medium text-slate-500">
                        <a href="/driver/support" className="flex items-center gap-1.5 hover:text-slate-700">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Support
                        </a>
                        <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15.3 15.3 0 010 18M12 3a15.3 15.3 0 000 18" />
                                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                            </svg>
                            English (US)
                        </span>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-400">
                        <p>© 2026 Clean Quick Laundry. All rights reserved.</p>
                        <p className="mt-1 text-slate-300">Driver access only — use admin login for staff portal</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
