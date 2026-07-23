import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Layout from '@/Layouts/AdminLayout';
import PaymentSettings from './PaymentSettings';
import BusinessProfileSettings from './BusinessProfileSettings';
import GeneralSettings from './GeneralSettings';
import MapSettings from './MapSettings';

export default function Edit({ settings }) {
    const { url } = usePage();
    
    // Extract tab parameter from query string if available
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (['payment', 'business', 'general', 'map'].includes(tabParam)) {
                return tabParam;
            }
        }
        return 'payment';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (['payment', 'business', 'general', 'map'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [url]);

    const { data, setData, post, processing, errors } = useForm({
        ...settings,
        remove_logo: false,
        remove_favicon: false,
        _method: 'put'
    });

    const [logoPreview, setLogoPreview] = useState(data.business_logo || '');
    const [faviconPreview, setFaviconPreview] = useState(data.business_favicon || '');

    function handleRemoveLogo() {
        setLogoPreview('');
        setData((prev) => ({
            ...prev,
            business_logo: '',
            remove_logo: true
        }));
    }

    function handleRemoveFavicon() {
        setFaviconPreview('');
        setData((prev) => ({
            ...prev,
            business_favicon: '',
            remove_favicon: true
        }));
    }

    function submit(e) {
        e.preventDefault();
        post('/admin/settings', { preserveScroll: true });
    }

    const titles = {
        payment: { title: 'Payment Settings', subtitle: 'Manage payment options, Stripe gateway keys, environment mode, and minimum order threshold.' },
        business: { title: 'Business Profile', subtitle: 'Corporate branding, brand logo, browser favicon, contact details, and invoice headers.' },
        general: { title: 'General & Delivery Fees', subtitle: 'Configure default currency symbol, VAT percentage, and base delivery fees.' },
        map: { title: 'Map & Live GPS Settings', subtitle: 'Configure map provider, default latitude/longitude center, zoom level, and live GPS polling frequency.' },
    };

    const currentMeta = titles[activeTab] || titles.payment;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Title Header */}
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{currentMeta.title}</h1>
                <p className="mt-1 text-slate-500 text-sm font-semibold">
                    {currentMeta.subtitle}
                </p>
            </div>

            <form onSubmit={submit} noValidate className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xs space-y-6">

                    {/* MENU-WISE FILE COMPONENTS */}
                    {activeTab === 'payment' && (
                        <PaymentSettings data={data} setData={setData} errors={errors} />
                    )}

                    {activeTab === 'business' && (
                        <BusinessProfileSettings
                            data={data}
                            setData={setData}
                            errors={errors}
                            logoPreview={logoPreview}
                            setLogoPreview={setLogoPreview}
                            handleRemoveLogo={handleRemoveLogo}
                            faviconPreview={faviconPreview}
                            setFaviconPreview={setFaviconPreview}
                            handleRemoveFavicon={handleRemoveFavicon}
                        />
                    )}

                    {activeTab === 'general' && (
                        <GeneralSettings data={data} setData={setData} errors={errors} />
                    )}

                    {activeTab === 'map' && (
                        <MapSettings data={data} setData={setData} errors={errors} />
                    )}

                    <hr className="border-slate-100" />

                    {/* Form Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-xs">💡</span>
                            <span className="text-[10px] font-bold leading-none">Changes take effect system-wide immediately after saving.</span>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold px-6 py-2.5 text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 min-w-[140px]"
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page) => <Layout children={page} />;
