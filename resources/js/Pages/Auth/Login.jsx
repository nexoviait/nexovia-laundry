import { useForm, usePage } from '@inertiajs/react';

export default function Login() {
    const { props } = usePage();
    const businessName = props.settings?.business_name || 'Clean Quick Laundry';
    const businessLogo = props.settings?.business_logo || '';
    const businessInitials = businessName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CQ';

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
            {/* Left Panel - Hero Branding & Laundry Illustration */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60">
                <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
                    {/* Glassmorphic Brand/Logo Container */}
                    <div className="mb-8 p-6 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/70">
                        {businessLogo ? (
                            <img src={businessLogo} alt={businessName} className="h-24 w-auto max-w-[200px] object-contain" />
                        ) : (
                            <div className="h-24 w-24 rounded-3xl bg-[#f95700] flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-orange-500/30">
                                {businessInitials}
                            </div>
                        )}
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
                        {businessName}
                    </h2>
                    <span className="inline-flex rounded-full bg-orange-600 px-3.5 py-1 text-xs font-bold text-white mb-4 uppercase tracking-widest">
                        Admin Control Center
                    </span>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                        Seamlessly monitor service areas, allocate collection/delivery schedules, edit prices, audit transactions, and orchestrate drivers.
                    </p>
                </div>
            </div>

            {/* Right Panel - Standard Login Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-200/50">
                    {/* Mobile logo brand */}
                    <div className="md:hidden flex items-center gap-3.5 mb-8">
                        {businessLogo ? (
                            <img src={businessLogo} alt={businessName} className="h-10 w-auto max-w-[120px] object-contain" />
                        ) : (
                            <span className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-orange-200">
                                {businessInitials}
                            </span>
                        )}
                        <div>
                            <h2 className="font-extrabold text-lg text-slate-900 leading-tight">{businessName}</h2>
                            <p className="text-xs text-slate-500 font-semibold">Admin Sign In</p>
                        </div>
                    </div>

                    <div className="mb-8 hidden md:block">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="mt-2 text-slate-500 text-sm font-semibold">
                            Enter your credentials to access the admin console
                        </p>
                    </div>

                    <form onSubmit={submit} noValidate className="space-y-5">
                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="admin@example.com"
                                required
                            />
                            {errors.email && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-2xl bg-[#f95700] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:bg-[#e04f00] transition-all disabled:opacity-50 mt-2"
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
