<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

/**
 * FR-CUS-027 / NFR-04: exposes the handful of business settings the
 * customer app needs before login — currency for amount formatting, plus
 * basic business info — without leaking anything admin-only (VAT rate,
 * delivery fee are already embedded in pricing responses, not here).
 */
class PublicSettingController extends Controller
{
    private const PUBLIC_KEYS = ['currency', 'business_name', 'business_phone', 'opening_hours'];

    public function show()
    {
        $settings = Setting::query()->whereIn('key', self::PUBLIC_KEYS)->pluck('value', 'key');

        return response()->json([
            'currency' => $settings->get('currency', 'GBP'),
            'business_name' => $settings->get('business_name'),
            'business_phone' => $settings->get('business_phone'),
            'opening_hours' => $settings->get('opening_hours'),
        ]);
    }
}
