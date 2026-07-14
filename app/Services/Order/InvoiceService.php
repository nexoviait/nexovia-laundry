<?php

namespace App\Services\Order;

use App\Models\Invoice;
use App\Models\Order;

/**
 * REQ-SHOP-05 / FR-OPS-005: invoice auto-generates when the order reaches
 * "ready". Idempotent — calling it twice for the same order just returns
 * the existing invoice rather than duplicating it.
 */
class InvoiceService
{
    public function generateForOrder(Order $order): Invoice
    {
        return Invoice::query()->firstOrCreate(
            ['order_id' => $order->id],
            [
                'vat' => $order->vat,
                'total' => $order->total,
                'status' => 'unpaid',
                'issued_at' => now(),
            ]
        );
    }
}
