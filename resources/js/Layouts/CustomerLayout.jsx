import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const NAV = [
    { href: '/dashboard', label: 'My Orders' },
    { href: '/book', label: 'Book Laundry' },
    { href: '/addresses', label: 'My Addresses' },
];

export default function CustomerLayout({ children }) {
    const { props, url } = usePage();
    const flash = props.flash || {};

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const avatarForm = useForm({
        name: props.auth?.user?.name || '',
        avatar: null,
    });

    useEffect(() => {
        if (flash.success || flash.error) {
            const timer = setTimeout(() => {
                router.reload({ only: [] });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.error]);

    const businessName = props.settings?.business_name || 'Clean Quick';
    const businessLogo = props.settings?.business_logo || '';
    const businessInitials = businessName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CQ';

    function handleAvatarSubmit(e) {
        e.preventDefault();
        avatarForm.post('/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowAvatarModal(false);
                setPreviewUrl(null);
            },
        });
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group min-w-0 shrink">
                        {businessLogo ? (
                            <img src={businessLogo} alt={businessName} className="h-9 w-9 sm:h-10 sm:w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-200 shrink-0 drop-shadow-xs" />
                        ) : (
                            <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0 font-display">
                                {businessInitials}
                            </span>
                        )}
                        <div className="leading-tight min-w-0 hidden sm:block">
                            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors truncate font-display block">
                                {businessName}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest leading-none block -mt-0.5">
                                Customer Portal
                            </span>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV.map((item) => {
                            const isActive =
                                (item.href === '/dashboard' && (url === '/dashboard' || url.startsWith('/orders'))) ||
                                (item.href !== '/dashboard' && url.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`text-sm font-display transition-all relative py-1 ${isActive
                                            ? 'text-orange-600 font-extrabold after:content-[""] after:absolute after:-bottom-[19px] after:left-0 after:right-0 after:h-[2.5px] after:bg-orange-600 after:rounded-full'
                                            : 'text-slate-600 font-bold hover:text-slate-900'
                                        }`}
                                    id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Customer Account Pill Box with Avatar Upload Trigger */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-slate-50 border border-slate-200/90 rounded-full p-1 sm:px-3 sm:py-1 flex items-center gap-1.5 sm:gap-2.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => {
                                    avatarForm.setData('name', props.auth?.user?.name || '');
                                    setShowAvatarModal(true);
                                }}
                                className="relative group cursor-pointer shrink-0"
                                title="Upload profile photo"
                            >
                                {props.auth?.user?.avatar_url ? (
                                    <img
                                        src={props.auth.user.avatar_url}
                                        alt={props.auth.user.name || 'User'}
                                        className="h-7 w-7 rounded-full object-cover shadow-xs border border-orange-300 group-hover:opacity-80 transition-opacity"
                                    />
                                ) : (
                                    <span className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xs uppercase shadow-xs font-display group-hover:opacity-80 transition-opacity">
                                        {props.auth?.user?.name ? props.auth?.user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CU'}
                                    </span>
                                )}
                                <span className="absolute -bottom-1 -right-1 bg-slate-900/80 text-white rounded-full p-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                                    📷
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    avatarForm.setData('name', props.auth?.user?.name || '');
                                    setShowAvatarModal(true);
                                }}
                                className="text-xs sm:text-sm font-extrabold text-slate-800 hidden sm:inline font-display hover:text-orange-600 transition-colors cursor-pointer"
                            >
                                {props.auth?.user?.name || 'Customer'}
                            </button>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-full border border-slate-200 bg-white hover:bg-slate-100 px-2.5 sm:px-3 py-1 text-[11px] font-extrabold text-slate-700 shadow-2xs transition-all whitespace-nowrap shrink-0 font-display cursor-pointer"
                                id="btn-logout"
                            >
                                Sign out
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 py-2 flex items-center justify-center gap-2 overflow-x-auto shadow-2xs">
                {NAV.map((item) => {
                    const isActive =
                        (item.href === '/dashboard' && (url === '/dashboard' || url.startsWith('/orders'))) ||
                        (item.href !== '/dashboard' && url.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-xs font-extrabold transition-all whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-full ${isActive
                                    ? 'bg-orange-50 text-orange-600 border border-orange-200/80 shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            {/* Avatar & Profile Upload Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-sm w-full space-y-5 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setShowAvatarModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                        >
                            ✕
                        </button>
                        
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-extrabold text-slate-900 font-display">Customer Profile Photo</h3>
                            <p className="text-xs text-slate-500 font-medium">Upload a profile picture for your account.</p>
                        </div>

                        <form onSubmit={handleAvatarSubmit} className="space-y-4">
                            {/* Photo Preview Circle */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-20 w-20 rounded-full bg-slate-100 border-2 border-orange-500/80 p-0.5 shadow-md overflow-hidden relative group">
                                    {previewUrl || props.auth?.user?.avatar_url ? (
                                        <img
                                            src={previewUrl || props.auth.user.avatar_url}
                                            alt="Preview"
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xl uppercase font-display">
                                            {props.auth?.user?.name ? props.auth?.user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CU'}
                                        </div>
                                    )}
                                </div>

                                <label className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold text-xs px-4 py-2 rounded-full border border-orange-200/80 transition-all flex items-center gap-1.5 font-display shadow-2xs">
                                    <span>📷 Select Image File</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                avatarForm.setData('avatar', file);
                                                setPreviewUrl(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={avatarForm.data.name}
                                    onChange={(e) => avatarForm.setData('name', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAvatarModal(false)}
                                    className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-50 font-display cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={avatarForm.processing}
                                    className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-orange-200 transition-all font-display disabled:opacity-50 cursor-pointer"
                                >
                                    {avatarForm.processing ? 'Uploading...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alert Notifications */}
                {flash.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 backdrop-blur-sm px-5 py-3.5 text-xs text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
                        <span className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">✓</span>
                        <span className="font-bold">{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 backdrop-blur-sm px-5 py-3.5 text-xs text-rose-900 flex items-center gap-3 animate-fade-in shadow-sm">
                        <span className="h-5 w-5 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold">!</span>
                        <span className="font-bold">{flash.error}</span>
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
