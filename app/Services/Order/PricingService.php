<?php

namespace App\Services\Order;

use App\Models\Service;
use App\Models\Setting;
use Illuminate\Validation\ValidationException;

/**
 * Shared pricing logic for the pre-booking estimate (REQ-CUST-08) and order
 * creation (REQ-CUST-01), so a quote always matches what the order actually
 * charges. VAT rate and delivery fee are centrally configurable settings
 * (REQ-ADM-07 / NFR-04), defaulting to 0 if unset.
 */
class PricingService
{
    /**
     * @param  array<int, array{service_id: int, qty: float|int}>  $lines
     * @param  int|null $addressId
     * @return array{items: array<int, array<string, mixed>>, subtotal: float, delivery_fee: float, vat: float, total: float}
     */
    public function priceLines(array $lines, ?int $addressId = null): array
    {
        $serviceIds = array_column($lines, 'service_id');

        $services = Service::query()
            ->whereIn('id', $serviceIds)
            ->where('active', true)
            ->get()
            ->keyBy('id');

        $items = [];
        $subtotal = 0.0;

        foreach ($lines as $line) {
            $service = $services->get($line['service_id']);

            if (! $service) {
                throw ValidationException::withMessages([
                    'items' => ["Service id {$line['service_id']} is not available."],
                ]);
            }

            $qty = (float) $line['qty'];
            $unitPrice = (float) $service->price;
            $lineTotal = round($unitPrice * $qty, 2);
            $subtotal += $lineTotal;

            $items[] = [
                'service_id' => $service->id,
                'name' => $service->name,
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'line_total' => $lineTotal,
            ];
        }

        $subtotal = round($subtotal, 2);
        $vatRate = (float) (Setting::query()->where('key', 'vat_rate')->value('value') ?? 0);
        
        $deliveryFee = null;
        if ($addressId) {
            $address = \App\Models\Address::find($addressId);
            if ($address && $address->serviceArea && $address->serviceArea->delivery_charge !== null) {
                $deliveryFee = (float) $address->serviceArea->delivery_charge;
            }
        }
        if ($deliveryFee === null) {
            $deliveryFee = (float) (Setting::query()->where('key', 'delivery_fee')->value('value') ?? 0);
        }

        $vat = round($subtotal * $vatRate / 100, 2);
        $total = round($subtotal + $deliveryFee + $vat, 2);

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'vat' => $vat,
            'total' => $total,
        ];
    }
}
