<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FR-SET-001/002/003: currency (GBP default), business profile, VAT rate,
 * and delivery charges — all centrally configurable (NFR-04).
 */
class AdminSettingController extends Controller
{
    private const KEYS = [
        'currency', 'vat_rate', 'delivery_fee',
        'business_name', 'business_phone', 'business_email', 'business_address', 'opening_hours',
        'business_logo', 'business_favicon',
        'enable_cod', 'enable_card', 'enable_online_payment',
        'stripe_publishable_key', 'stripe_secret_key', 'payment_mode', 'minimum_order_amount',
        'map_provider', 'google_maps_api_key', 'map_default_lat', 'map_default_lng', 'map_default_zoom', 'map_refresh_interval',
        'available_zone_names', 'available_countries', 'available_time_windows', 'available_service_categories',
    ];

    public function edit(): Response
    {
        $settings = Setting::query()->whereIn('key', self::KEYS)->pluck('value', 'key');

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => [
                'currency' => $settings->get('currency', 'GBP'),
                'vat_rate' => $settings->get('vat_rate', '0'),
                'delivery_fee' => $settings->get('delivery_fee', '0'),
                'business_name' => $settings->get('business_name', ''),
                'business_phone' => $settings->get('business_phone', ''),
                'business_email' => $settings->get('business_email', ''),
                'business_address' => $settings->get('business_address', ''),
                'opening_hours' => $settings->get('opening_hours', ''),
                'business_logo' => $settings->get('business_logo', ''),
                'business_favicon' => $settings->get('business_favicon', ''),
                'enable_cod' => $settings->get('enable_cod', 'true') === 'true',
                'enable_card' => $settings->get('enable_card', 'true') === 'true',
                'enable_online_payment' => $settings->get('enable_online_payment', 'false') === 'true',
                'stripe_publishable_key' => $settings->get('stripe_publishable_key', ''),
                'stripe_secret_key' => $settings->get('stripe_secret_key', ''),
                'payment_mode' => $settings->get('payment_mode', 'test'),
                'minimum_order_amount' => $settings->get('minimum_order_amount', '10.00'),
                'map_provider' => $settings->get('map_provider', 'openstreetmap'),
                'google_maps_api_key' => $settings->get('google_maps_api_key', ''),
                'map_default_lat' => $settings->get('map_default_lat', '52.4862'),
                'map_default_lng' => $settings->get('map_default_lng', '-1.8904'),
                'map_default_zoom' => $settings->get('map_default_zoom', '12'),
                'map_refresh_interval' => $settings->get('map_refresh_interval', '5'),
                'available_zone_names' => $settings->get('available_zone_names', 'Dhaka, Chittagong, Motijheel, Lozells, Handsworth, Newtown, Sylhet, Mirpur, Banani, Gulshan'),
                'available_countries' => $settings->get('available_countries', 'Bangladesh, United Kingdom, United States, United Arab Emirates, Saudi Arabia, Canada'),
                'available_time_windows' => $settings->get('available_time_windows', '08:00 - 10:00, 09:00 - 12:00, 10:00 - 12:00, 12:00 - 14:00, 12:00 - 15:00, 14:00 - 16:00, 15:00 - 18:00, 16:00 - 18:00, 18:00 - 20:00'),
                'available_service_categories' => $settings->get('available_service_categories', 'Wash & Fold, Dry Cleaning, Ironing & Pressing, Duvet & Bulky, Bedding & Linens, Commercial Laundry, Alterations & Repairs'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        if ($request->has('currency')) {
            $request->merge(['currency' => strtoupper($request->input('currency'))]);
        }

        $data = $request->validate([
            'currency' => ['required', 'string', 'in:GBP,USD,EUR'],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'delivery_fee' => ['required', 'numeric', 'min:0'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'business_phone' => ['nullable', 'string', 'max:30'],
            'business_email' => ['nullable', 'email', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'business_logo' => ['nullable'],
            'business_favicon' => ['nullable'],
            'enable_cod' => ['nullable', 'boolean'],
            'enable_card' => ['nullable', 'boolean'],
            'enable_online_payment' => ['nullable', 'boolean'],
            'stripe_publishable_key' => ['nullable', 'string', 'max:255'],
            'stripe_secret_key' => ['nullable', 'string', 'max:255'],
            'payment_mode' => ['nullable', 'string', 'in:test,live'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'map_provider' => ['nullable', 'string', 'in:openstreetmap,google_maps'],
            'google_maps_api_key' => ['nullable', 'string', 'max:255'],
            'map_default_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'map_default_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'map_default_zoom' => ['nullable', 'integer', 'between:1,20'],
            'map_refresh_interval' => ['nullable', 'integer', 'between:1,60'],
            'available_zone_names' => ['nullable', 'string', 'max:1000'],
            'available_countries' => ['nullable', 'string', 'max:1000'],
            'available_time_windows' => ['nullable', 'string', 'max:1000'],
            'available_service_categories' => ['nullable', 'string', 'max:1000'],
        ]);

        $data['currency'] = strtoupper($data['currency']);
        $data['enable_cod'] = $request->boolean('enable_cod', true) ? 'true' : 'false';
        $data['enable_card'] = $request->boolean('enable_card', true) ? 'true' : 'false';
        $data['enable_online_payment'] = $request->boolean('enable_online_payment', false) ? 'true' : 'false';
        $data['payment_mode'] = $data['payment_mode'] ?? 'test';
        $data['minimum_order_amount'] = (string) ($data['minimum_order_amount'] ?? '0.00');

        if ($request->hasFile('business_logo')) {
            $path = $request->file('business_logo')->store('logos', 'public');
            Setting::query()->updateOrCreate(['key' => 'business_logo'], ['value' => '/uploads/' . $path]);
        } elseif ($request->input('remove_logo') === 'true' || $request->input('remove_logo') === true) {
            Setting::query()->where('key', 'business_logo')->delete();
        }
        unset($data['business_logo']);

        if ($request->hasFile('business_favicon')) {
            $path = $request->file('business_favicon')->store('favicons', 'public');
            Setting::query()->updateOrCreate(['key' => 'business_favicon'], ['value' => '/uploads/' . $path]);
        } elseif ($request->input('remove_favicon') === 'true' || $request->input('remove_favicon') === true) {
            Setting::query()->where('key', 'business_favicon')->delete();
        }
        unset($data['business_favicon']);

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return back()->with('success', 'Settings updated.');
    }
}
