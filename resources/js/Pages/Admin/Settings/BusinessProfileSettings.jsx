export default function BusinessProfileSettings({
    data,
    setData,
    errors,
    logoPreview,
    setLogoPreview,
    handleRemoveLogo,
    faviconPreview,
    setFaviconPreview,
    handleRemoveFavicon,
}) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Business Profile</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Corporate branding, contact details, and invoice headers.</p>
            </div>

            <div className="space-y-4">
                {/* Brand Logo Upload */}
                <div className="space-y-2 border-b border-slate-100 pb-4">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Brand Logo</label>
                    <div className="flex items-center gap-4">
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-16 w-auto max-w-[200px] rounded-2xl border border-slate-200 bg-white object-contain p-2 shadow-xs"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                No Logo
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setData((prev) => ({
                                                ...prev,
                                                business_logo: file,
                                                remove_logo: false
                                            }));
                                            setLogoPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="text-xs font-semibold text-slate-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                />
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="px-2.5 py-1.5 text-[10px] font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all cursor-pointer"
                                    >
                                        Remove Logo
                                    </button>
                                )}
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold">Recommended: PNG format with transparent background (max 2MB).</p>
                        </div>
                    </div>
                    {errors.business_logo && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_logo}</p>}
                </div>

                {/* Favicon Upload */}
                <div className="space-y-2 border-b border-slate-100 pb-4">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Browser Favicon Icon</label>
                    <div className="flex items-center gap-4">
                        {faviconPreview ? (
                            <img
                                src={faviconPreview}
                                alt="Favicon preview"
                                className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 object-contain p-1 shadow-2xs"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                ICO
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/x-icon,image/png,image/svg+xml,image/gif"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setData((prev) => ({
                                                ...prev,
                                                business_favicon: file,
                                                remove_favicon: false
                                            }));
                                            setFaviconPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="text-xs font-semibold text-slate-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                />
                                {faviconPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveFavicon}
                                        className="px-2.5 py-1.5 text-[10px] font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all cursor-pointer"
                                    >
                                        Remove Favicon
                                    </button>
                                )}
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold">Recommended: .ico or square .png (32x32px or 64x64px).</p>
                        </div>
                    </div>
                    {errors.business_favicon && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_favicon}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Business Name</label>
                    <input
                        value={data.business_name}
                        onChange={(e) => setData('business_name', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                    />
                    {errors.business_name && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_name}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone</label>
                        <input
                            value={data.business_phone}
                            onChange={(e) => setData('business_phone', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        {errors.business_phone && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_phone}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Email</label>
                        <input
                            type="text"
                            value={data.business_email}
                            onChange={(e) => setData('business_email', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        {errors.business_email && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_email}</p>}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Address</label>
                    <textarea
                        value={data.business_address}
                        onChange={(e) => setData('business_address', e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                    />
                    {errors.business_address && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.business_address}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Opening Hours</label>
                    <input
                        value={data.opening_hours}
                        onChange={(e) => setData('opening_hours', e.target.value)}
                        placeholder="Mon-Sat 08:00-18:00"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                    />
                    {errors.opening_hours && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.opening_hours}</p>}
                </div>
            </div>
        </div>
    );
}
