<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\GarmentTag;
use App\Models\Order;
use App\Models\OrderNote;
use App\Models\Setting;
use App\Services\Order\InvoiceService;
use App\Services\Order\OrderStatusMachine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FR-OPS-001: receive order with mismatch flagging.
 * FR-OPS-002: print a QR tag per order bag (garment tag).
 * FR-OPS-005: final weight confirmation -> invoice -> ready.
 */
class ShopOrderController extends Controller
{
    public function __construct(
        private readonly OrderStatusMachine $machine,
        private readonly InvoiceService $invoices,
    ) {}

    public function receive(Request $request, Order $order)
    {
        if ($order->status !== OrderStatus::PickedUp) {
            return back()->with('error', 'This order has already been received.');
        }

        $data = $request->validate([
            'counts' => ['required', 'array', 'min:1'],
            'counts.*.order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'counts.*.actual_qty' => ['required', 'numeric', 'min:0'],
        ]);

        $order->load('items');
        $mismatches = [];

        DB::transaction(function () use ($order, $data, &$mismatches) {
            $actuals = collect($data['counts'])->keyBy('order_item_id');

            foreach ($order->items as $item) {
                $actualQty = (float) ($actuals->get($item->id)['actual_qty'] ?? $item->qty);
                $mismatch = abs($actualQty - (float) $item->qty) > 0.001;

                if ($mismatch) {
                    $mismatches[] = "{$item->service?->name}: expected {$item->qty}, received {$actualQty}";
                }

                GarmentTag::query()->updateOrCreate(
                    ['order_item_id' => $item->id],
                    [
                        'qr_code' => (string) Str::uuid(),
                        'stage' => 'received',
                        'issue_flag' => $mismatch,
                        'issue_note' => $mismatch
                            ? "Quantity mismatch: expected {$item->qty}, received {$actualQty}"
                            : null,
                    ]
                );
            }

            if (! empty($mismatches)) {
                OrderNote::create([
                    'order_id' => $order->id,
                    'user_id' => auth()->id(),
                    'note' => "Intake mismatch flagged:\n".implode("\n", $mismatches),
                    'visible_to_customer' => false,
                ]);
            }
        });

        $this->machine->transition($order, OrderStatus::Processing, $request->user());

        return back()->with(
            'success',
            $mismatches ? 'Order received with a quantity mismatch — flagged for review.' : 'Order received.'
        );
    }

    public function tags(Order $order): Response
    {
        $order->load(['items.service', 'items.garmentTags']);

        return Inertia::render('Shop/Orders/Tags', [
            // See AdminOrderController::show() for why this needs a json
            // round-trip rather than passing the JsonResource directly.
            'order' => json_decode(json_encode(new OrderResource($order)), true),
        ]);
    }

    public function finalize(Request $request, Order $order)
    {
        $data = $request->validate([
            'final_weight' => ['nullable', 'numeric', 'min:0'],
            'adjustments' => ['nullable', 'array'],
            'adjustments.*.order_item_id' => ['required_with:adjustments', 'integer', 'exists:order_items,id'],
            'adjustments.*.qty' => ['required_with:adjustments', 'numeric', 'min:0.01'],
        ]);

        $order->load('items.service');

        DB::transaction(function () use ($order, $data) {
            foreach ($data['adjustments'] ?? [] as $adjustment) {
                $item = $order->items->firstWhere('id', $adjustment['order_item_id']);

                if (! $item || $item->service?->unit !== 'kg') {
                    continue;
                }

                $lineTotal = round((float) $item->unit_price * (float) $adjustment['qty'], 2);
                $item->update(['qty' => $adjustment['qty'], 'line_total' => $lineTotal]);
            }

            $order->load('items');
            $subtotal = round((float) $order->items->sum('line_total'), 2);
            $vatRate = (float) (Setting::query()->where('key', 'vat_rate')->value('value') ?? 0);
            $vat = round($subtotal * $vatRate / 100, 2);
            $total = round($subtotal - (float) $order->discount + (float) $order->delivery_fee + $vat, 2);

            $order->update([
                'final_weight' => $data['final_weight'] ?? $order->final_weight,
                'subtotal' => $subtotal,
                'vat' => $vat,
                'total' => max(0, $total),
            ]);
        });

        try {
            $this->machine->transition($order->fresh(), OrderStatus::Ready, $request->user());
        } catch (InvalidOrderTransitionException $e) {
            throw ValidationException::withMessages([
                'final_weight' => ['Not every item has reached quality check yet.'],
            ]);
        }

        $this->invoices->generateForOrder($order->fresh());

        return redirect()->route('shop.board')->with('success', 'Order finalized — invoice generated.');
    }
}
