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
    ];

    public function edit(): Response
    {
        $settings = Setting::query()->whereIn('key', self::KEYS)->pluck('value', 'key');

        return Inertia::render('Settings/Edit', [
            'settings' => [
                'currency' => $settings->get('currency', 'GBP'),
                'vat_rate' => $settings->get('vat_rate', '0'),
                'delivery_fee' => $settings->get('delivery_fee', '0'),
                'business_name' => $settings->get('business_name', ''),
                'business_phone' => $settings->get('business_phone', ''),
                'business_email' => $settings->get('business_email', ''),
                'business_address' => $settings->get('business_address', ''),
                'opening_hours' => $settings->get('opening_hours', ''),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'currency' => ['required', 'string', 'size:3'],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'delivery_fee' => ['required', 'numeric', 'min:0'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'business_phone' => ['nullable', 'string', 'max:30'],
            'business_email' => ['nullable', 'email', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
        ]);

        $data['currency'] = strtoupper($data['currency']);

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return back()->with('success', 'Settings updated.');
    }
}
