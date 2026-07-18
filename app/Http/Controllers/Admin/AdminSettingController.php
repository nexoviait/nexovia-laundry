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
        'business_logo',
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
        ]);

        $data['currency'] = strtoupper($data['currency']);

        if ($request->hasFile('business_logo')) {
            $path = $request->file('business_logo')->store('logos', 'public');
            Setting::query()->updateOrCreate(['key' => 'business_logo'], ['value' => '/storage/' . $path]);
        } elseif ($request->input('remove_logo') === 'true' || $request->input('remove_logo') === true) {
            Setting::query()->where('key', 'business_logo')->delete();
        }
        unset($data['business_logo']);

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return back()->with('success', 'Settings updated.');
    }
}
