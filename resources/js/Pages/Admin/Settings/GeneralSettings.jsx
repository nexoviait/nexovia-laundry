export default function GeneralSettings({ data, setData, errors }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Currency, Taxes & Delivery Fees</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">System constants, currency symbols, default VAT, and delivery charges.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Currency</label>
                    <select
                        value={data.currency}
                        onChange={(e) => setData('currency', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                    >
                        <option value="GBP">GBP (£)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                    {errors.currency && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.currency}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">VAT Rate (%)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.vat_rate}
                        onChange={(e) => setData('vat_rate', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                    />
                    {errors.vat_rate && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.vat_rate}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Base Delivery Fee ({data.currency})</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.delivery_fee}
                        onChange={(e) => setData('delivery_fee', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                    />
                    {errors.delivery_fee && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.delivery_fee}</p>}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">System Dropdown Options (Zones, Time Slots, Categories)</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Configure predefined Zone Names, Countries, Time Windows, and Service Categories that populate dropdown selection menus across the admin management portals.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Predefined Zone Names</label>
                        <textarea
                            rows={3}
                            value={data.available_zone_names || ''}
                            onChange={(e) => setData('available_zone_names', e.target.value)}
                            placeholder="Dhaka, Chittagong, Motijheel, Lozells, Handsworth, Newtown..."
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl p-3 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 font-semibold">Separated by commas.</p>
                        {errors.available_zone_names && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.available_zone_names}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Predefined Countries</label>
                        <textarea
                            rows={3}
                            value={data.available_countries || ''}
                            onChange={(e) => setData('available_countries', e.target.value)}
                            placeholder="Bangladesh, United Kingdom, United States, Saudi Arabia..."
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl p-3 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 font-semibold">Separated by commas.</p>
                        {errors.available_countries && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.available_countries}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Predefined Time Windows</label>
                        <textarea
                            rows={3}
                            value={data.available_time_windows || ''}
                            onChange={(e) => setData('available_time_windows', e.target.value)}
                            placeholder="08:00 - 10:00, 09:00 - 12:00, 12:00 - 15:00..."
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl p-3 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 font-semibold">Separated by commas.</p>
                        {errors.available_time_windows && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.available_time_windows}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Predefined Service Categories</label>
                        <textarea
                            rows={3}
                            value={data.available_service_categories || ''}
                            onChange={(e) => setData('available_service_categories', e.target.value)}
                            placeholder="Wash & Fold, Dry Cleaning, Ironing & Pressing, Duvet & Bulky..."
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl p-3 text-xs font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 font-semibold">Separated by commas.</p>
                        {errors.available_service_categories && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.available_service_categories}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
