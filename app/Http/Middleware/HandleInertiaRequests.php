<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settingsPlucked = collect();
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $settingsPlucked = \App\Models\Setting::pluck('value', 'key');
            }
        } catch (\Throwable $e) {
            // Fallback
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'settings' => [
                'currency' => $settingsPlucked->get('currency', 'GBP'),
                'vat_rate' => $settingsPlucked->get('vat_rate', '0'),
                'delivery_fee' => $settingsPlucked->get('delivery_fee', '0'),
                'business_name' => $settingsPlucked->get('business_name', 'CQ Clean Laundry'),
                'business_phone' => $settingsPlucked->get('business_phone', ''),
                'business_email' => $settingsPlucked->get('business_email', ''),
                'business_address' => $settingsPlucked->get('business_address', ''),
                'opening_hours' => $settingsPlucked->get('opening_hours', ''),
                'business_logo' => $settingsPlucked->get('business_logo', ''),
            ],
        ];
    }
}
