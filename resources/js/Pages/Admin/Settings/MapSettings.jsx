export default function MapSettings({ data, setData, errors }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Live Map & GPS Tracking Configuration</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Configure map providers, default center coordinates, zoom levels, and live polling intervals.</p>
            </div>

            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Map Provider</label>
                        <select
                            value={data.map_provider || 'openstreetmap'}
                            onChange={(e) => setData('map_provider', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2.5 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                        >
                            <option value="openstreetmap">OpenStreetMap (Free & Open Source)</option>
                            <option value="google_maps">Google Maps JS API</option>
                        </select>
                        {errors.map_provider && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.map_provider}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Live Refresh Rate (seconds)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={data.map_refresh_interval || '5'}
                            onChange={(e) => setData('map_refresh_interval', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 transition-all focus:outline-none"
                        />
                        {errors.map_refresh_interval && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.map_refresh_interval}</p>}
                    </div>

                    {data.map_provider === 'google_maps' && (
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Google Maps API Key</label>
                            <input
                                type="text"
                                value={data.google_maps_api_key || ''}
                                onChange={(e) => setData('google_maps_api_key', e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-mono font-semibold text-slate-800 transition-all focus:outline-none"
                            />
                            {errors.google_maps_api_key && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.google_maps_api_key}</p>}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Default Map Center & Initial Zoom</h4>
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Default Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={data.map_default_lat || '52.4862'}
                                onChange={(e) => setData('map_default_lat', e.target.value)}
                                placeholder="52.4862"
                                className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 focus:outline-none"
                            />
                            {errors.map_default_lat && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.map_default_lat}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Default Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={data.map_default_lng || '-1.8904'}
                                onChange={(e) => setData('map_default_lng', e.target.value)}
                                placeholder="-1.8904"
                                className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 focus:outline-none"
                            />
                            {errors.map_default_lng && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.map_default_lng}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Default Zoom Level (1-18)</label>
                            <input
                                type="number"
                                min="1"
                                max="18"
                                value={data.map_default_zoom || '12'}
                                onChange={(e) => setData('map_default_zoom', e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 focus:outline-none"
                            />
                            {errors.map_default_zoom && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.map_default_zoom}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
