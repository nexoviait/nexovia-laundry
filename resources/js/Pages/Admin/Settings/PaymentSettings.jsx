export default function PaymentSettings({ data, setData, errors }) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Payment System & Gateways</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Enable doorstep payment options, Stripe integration, and order thresholds.</p>
            </div>

            <div className="space-y-6">
                {/* Payment Method Toggles */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">💵 Cash on Delivery (COD)</span>
                            <input
                                type="checkbox"
                                checked={data.enable_cod}
                                onChange={(e) => setData('enable_cod', e.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            Allow customers to pay cash directly to the courier upon delivery.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">💳 Card Reader / Doorstep</span>
                            <input
                                type="checkbox"
                                checked={data.enable_card}
                                onChange={(e) => setData('enable_card', e.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            Accept contactless POS card payments at collection or delivery.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">🌐 Online Payment Gateway</span>
                            <input
                                type="checkbox"
                                checked={data.enable_online_payment}
                                onChange={(e) => setData('enable_online_payment', e.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            Enable instant online checkout via Stripe or direct card processing.
                        </p>
                    </div>
                </div>

                {/* Stripe Config */}
                {data.enable_online_payment && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/30 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-extrabold text-orange-950 uppercase tracking-wider">Stripe Gateway API Settings</h4>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${data.payment_mode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {data.payment_mode === 'live' ? 'LIVE PRODUCTION' : 'TEST SANDBOX'}
                            </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Environment Mode</label>
                                <select
                                    value={data.payment_mode}
                                    onChange={(e) => setData('payment_mode', e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 focus:outline-none"
                                >
                                    <option value="test">Test Sandbox (pk_test_...)</option>
                                    <option value="live">Live Production (pk_live_...)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Minimum Order Amount ({data.currency})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.minimum_order_amount}
                                    onChange={(e) => setData('minimum_order_amount', e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-extrabold text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Stripe Publishable Key</label>
                                <input
                                    type="text"
                                    value={data.stripe_publishable_key}
                                    onChange={(e) => setData('stripe_publishable_key', e.target.value)}
                                    placeholder="pk_test_51Nx..."
                                    className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Stripe Secret Key</label>
                                <input
                                    type="password"
                                    value={data.stripe_secret_key}
                                    onChange={(e) => setData('stripe_secret_key', e.target.value)}
                                    placeholder="sk_test_51Nx..."
                                    className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl py-2 px-3.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
