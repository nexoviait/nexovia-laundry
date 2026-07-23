import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const { props } = usePage();
    const flash = props.flash || {};
    const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input

    const phoneForm = useForm({
        phone: '',
    });

    const verifyForm = useForm({
        phone: '',
        otp: '',
        name: '',
    });

    function requestOtp(e) {
        e.preventDefault();
        phoneForm.post('/login/request', {
            onSuccess: () => {
                verifyForm.setData('phone', phoneForm.data.phone);
                setStep(2);
            },
        });
    }

    function verifyOtp(e) {
        e.preventDefault();
        verifyForm.post('/login/verify');
    }
    return (
        <div className="customer-portal min-h-screen flex font-sans">
            {/* Left Panel - Hero Branding & Laundry Illustration (visible on md and above) */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-slate-50 to-orange-50/40">
                <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
                    {/* Glassmorphic Laundry SVG Illustration Container */}
                    <div className="mb-8 p-6 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/60">
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

                    <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display mb-3">
                        Clean Quick Laundry
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-4 py-1 text-xs font-bold text-orange-600 border border-orange-500/20 uppercase tracking-widest font-display shadow-xs mb-4">
                        Customer Portal
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-sm font-normal">
                        Create an account or sign in to book instant laundry services, configure personal preferences, and track active bookings straight to your door.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Forms */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md bg-white p-5 sm:p-8 md:p-10 rounded-3xl border border-slate-100/90 shadow-xl shadow-slate-200/40 space-y-5 sm:space-y-6">
                    {/* Small mobile logo brand */}
                    <div className="md:hidden flex items-center gap-3 mb-4">
                        <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-orange-200 font-display">
                            CQ
                        </span>
                        <div>
                            <h2 className="font-extrabold text-base text-slate-900 leading-tight font-display">Clean Quick Laundry</h2>
                            <p className="text-xs text-slate-500 font-medium">
                                {step === 1 ? 'Customer Login' : 'Enter OTP Verification'}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 hidden md:block">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                            {step === 1 ? 'Welcome' : 'Verify Code'}
                        </h1>
                        <p className="mt-2.5 text-slate-600 text-sm font-medium leading-relaxed">
                            {step === 1 
                                ? 'Enter your phone number to sign in or register' 
                                : 'Enter the 6-digit verification code sent to your phone'}
                        </p>
                    </div>

                    {/* Notifications */}
                    {flash.success && (
                        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fade-in">
                            <span className="text-emerald-600 text-sm">✓</span>
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 px-4 py-3 text-xs text-rose-900 font-semibold flex items-center gap-2 animate-fade-in">
                            <span className="text-rose-600 text-sm">✕</span>
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={requestOtp} noValidate className="space-y-4 sm:space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="+447700900555"
                                    value={phoneForm.data.phone}
                                    onChange={(e) => phoneForm.setData('phone', e.target.value)}
                                    className={`w-full rounded-2xl border ${
                                        phoneForm.errors.phone ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-200' : 'border-slate-200/80 focus:border-orange-500 focus:ring-orange-100'
                                    } px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400/70 transition-all focus:outline-none focus:ring-4`}
                                    autoFocus
                                />
                                {phoneForm.errors.phone && (
                                    <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                        {phoneForm.errors.phone}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={phoneForm.processing}
                                id="btn-request-otp"
                                className="w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 active:scale-[0.99] px-4 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 font-display disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {phoneForm.processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Send Verification Code
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyOtp} noValidate className="space-y-4 sm:space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="otp" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                                        6-Digit Verification Code
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        maxLength="6"
                                        placeholder="123456"
                                        value={verifyForm.data.otp}
                                        onChange={(e) => verifyForm.setData('otp', e.target.value)}
                                        className={`w-full rounded-2xl border ${
                                            verifyForm.errors.otp ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-200' : 'border-slate-200/80 focus:border-orange-500 focus:ring-orange-100'
                                        } px-4 py-3 text-center font-mono text-xl sm:text-2xl tracking-widest font-extrabold text-slate-900 transition-all focus:outline-none focus:ring-4`}
                                    />
                                    {verifyForm.errors.otp && (
                                        <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                            {verifyForm.errors.otp}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
                                        Your Full Name <span className="text-orange-600 font-extrabold">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={verifyForm.data.name}
                                        onChange={(e) => verifyForm.setData('name', e.target.value)}
                                        className={`w-full rounded-2xl border ${
                                            verifyForm.errors.name ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-200' : 'border-slate-200/80 focus:border-orange-500 focus:ring-orange-100'
                                        } px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400/70 transition-all focus:outline-none focus:ring-4`}
                                    />
                                    {verifyForm.errors.name && (
                                        <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1.5 animate-fade-in">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                            {verifyForm.errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold font-display">
                                <button
                                    type="button"
                                    onClick={() => router.get('/login')}
                                    className="text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                    ← Change number
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={verifyForm.processing}
                                id="btn-verify-otp"
                                className="w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 active:scale-[0.99] px-4 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 font-display disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {verifyForm.processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Verify & Log In
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </form>
                    )}
                    {/* Standard Copyright Footer */}
                    <div className="mt-6 sm:mt-8 text-center text-xs font-medium text-slate-500">
                        <p>© {new Date().getFullYear()} Clean Quick Laundry. Developed by <a href="https://nexoviait.com/" target="_blank" rel="noopener noreferrer" className="font-extrabold text-[#f95700] hover:underline">Nexovia IT Limited</a>. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
