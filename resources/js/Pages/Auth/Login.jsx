import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin/login');
    }

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            {/* Left Panel - Hero Branding & Laundry Illustration (visible on md and above) */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60">
                <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
                    {/* Glassmorphic Laundry SVG Illustration Container */}
                    <div className="mb-8 p-6 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/70">
                        <svg viewBox="0 0 300 300" className="w-72 h-72 text-slate-500 drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Floating Bubbles */}
                            <circle cx="50" cy="80" r="10" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" className="animate-pulse" />
                            <circle cx="80" cy="50" r="6" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
                            <circle cx="240" cy="90" r="14" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1" className="animate-pulse" />
                            <circle cx="220" cy="60" r="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
                            
                            {/* Hanger and hanging shirt */}
                            <g transform="translate(140, 20)">
                                {/* Hook */}
                                <path d="M40 30 C 40 18, 50 18, 48 10 C 45 4, 38 8, 38 8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                                {/* Hanger Triangle */}
                                <path d="M10 40 L40 28 L70 40 Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.02" />
                                {/* Garment Shirt */}
                                <path d="M10 40 L-2 65 L18 72 L22 55 L22 110 L58 110 L58 55 L62 72 L82 65 L70 40 Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
                                {/* Shirt fold line */}
                                <path d="M40 40 L40 110" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                            </g>

                            {/* Washing Machine */}
                            <g transform="translate(40, 100)">
                                {/* Machine Body */}
                                <rect x="10" y="20" width="130" height="160" rx="20" stroke="currentColor" strokeWidth="5.5" fill="currentColor" fillOpacity="0.02" />
                                {/* Control Dial */}
                                <circle cx="35" cy="45" r="7" stroke="currentColor" strokeWidth="4" />
                                {/* Indicator lights / Display */}
                                <rect x="60" y="40" width="32" height="10" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                                <circle cx="108" cy="45" r="4" fill="currentColor" />
                                <circle cx="120" cy="45" r="4" fill="currentColor" opacity="0.5" />
                                
                                {/* Door Outer Circle */}
                                <circle cx="75" cy="110" r="42" stroke="currentColor" strokeWidth="5" fill="currentColor" fillOpacity="0.05" />
                                {/* Door Inner Circle / Glass */}
                                <circle cx="75" cy="110" r="34" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                                
                                {/* Water / Clothes wave inside */}
                                <path d="M47 114 C 60 102, 70 122, 85 110 C 95 102, 103 114, 103 114" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                                <path d="M51 124 C 63 114, 73 132, 87 120 C 96 112, 99 124, 99 124" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                                
                                {/* Suds inside */}
                                <circle cx="65" cy="95" r="3" fill="currentColor" />
                                <circle cx="85" cy="92" r="4" fill="currentColor" />
                                <circle cx="75" cy="100" r="2.5" fill="currentColor" />
                            </g>

                            {/* Sparkles / Clean stars */}
                            <path d="M210 160 L213 168 L221 171 L213 174 L210 182 L207 174 L199 171 L207 168 Z" fill="#f97316" />
                            <path d="M250 200 L251.5 204 L255.5 205.5 L251.5 207 L250 211 L248.5 207 L244.5 205.5 L248.5 204 Z" fill="#f97316" opacity="0.8" />
                            <path d="M25 240 L27 245 L32 247 L27 249 L25 254 L23 249 L18 247 L23 245 Z" fill="#f97316" opacity="0.6" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
                        Clean Quick Laundry
                    </h2>
                    <span className="inline-flex rounded-full bg-orange-600 px-3.5 py-1 text-xs font-bold text-white mb-4 uppercase tracking-widest">
                        Admin Portal
                    </span>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                        Seamlessly monitor service areas, allocate collection/delivery schedules, edit prices, audit transactions, and orchestrate drivers.
                    </p>
                </div>
            </div>

            {/* Right Panel - Standard Login Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-200/50">
                    {/* Small mobile logo brand */}
                    <div className="md:hidden flex items-center gap-3.5 mb-8">
                        <span className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-orange-200">
                            CQ
                        </span>
                        <div>
                            <h2 className="font-extrabold text-lg text-slate-900 leading-tight">Clean Quick Laundry</h2>
                            <p className="text-xs text-slate-500 font-semibold">Admin Sign In</p>
                        </div>
                    </div>

                    <div className="mb-8 hidden md:block">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="mt-2 text-slate-500 text-sm font-semibold">
                            Enter your admin credentials to access your console
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full rounded-2xl border ${
                                    errors.email ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                                } px-4 py-3.5 text-sm font-medium text-slate-800 transition-all focus:outline-none focus:ring-4`}
                                placeholder="name@cleanquicklaundry.com"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full rounded-2xl border ${
                                    errors.password ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                                } px-4 py-3.5 text-sm font-medium text-slate-800 transition-all focus:outline-none focus:ring-4`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] px-4 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-100 hover:shadow-xl hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Standard Copyright Footer */}
                    <div className="mt-16 text-center text-xs font-bold text-slate-400">
                        <p>© 2026 Clean Quick Laundry. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

