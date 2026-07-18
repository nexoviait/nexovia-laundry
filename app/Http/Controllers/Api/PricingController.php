<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Order\PricingService;
use Illuminate\Http\Request;

/**
 * REQ-CUST-08: a live price estimate while the customer is building their
 * basket, using the exact same pricing logic order creation applies.
 */
class PricingController extends Controller
{
    public function __construct(private readonly PricingService $pricing) {}

    public function estimate(Request $request)
    {
        $data = $request->validate([
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
        ]);

        return response()->json($this->pricing->priceLines($data['items'], $data['address_id'] ?? null));
    }
}
