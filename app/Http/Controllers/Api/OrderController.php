<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StatusHistory;
use App\Models\TimeSlot;
use App\Services\Booking\ServiceAreaGate;
use App\Services\Notifications\OrderStatusNotifier;
use App\Services\Order\OrderStatusMachine;
use App\Services\Order\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * REQ-CUST-01/06/08/09/10/12/14: order creation, browsing, cancellation,
 * and invoice retrieval for the authenticated customer.
 */
class OrderController extends Controller
{
    /** Self-service cancellation window — see §4.2: standard cancel closes once processing starts. */
    private const CUSTOMER_CANCELLABLE_STATUSES = [
        OrderStatus::Pending,
        OrderStatus::Confirmed,
        OrderStatus::Assigned,
    ];

    public function __construct(
        private readonly ServiceAreaGate $areaGate,
        private readonly PricingService $pricing,
        private readonly OrderStatusMachine $machine,
        private readonly OrderStatusNotifier $notifier,
    ) {}

    public function index(Request $request)
    {
        $orders = Order::query()
            ->with(['address.serviceArea', 'timeSlot', 'items.service'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        $order->load([
            'address.serviceArea',
            'timeSlot',
            'items.service',
            'items.garmentTags',
            'invoice',
            'statusHistories' => fn ($query) => $query->with('changedBy')->oldest(),
            'driverTasks.driver',
        ]);

        return new OrderResource($order);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'address_id' => ['required', 'integer'],
            'time_slot_id' => ['required', 'integer'],
            'note' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
        ]);

        $user = $request->user();

        // Scoped to the caller's own addresses by the customer-isolation global scope.
        $address = Address::query()->findOrFail($data['address_id']);

        $this->areaGate->assertAddressInActiveArea($address, $user, 'Blocked at checkout');

        $order = DB::transaction(function () use ($data, $user, $address) {
            $timeSlot = TimeSlot::query()->lockForUpdate()->findOrFail($data['time_slot_id']);

            $booked = Order::query()->withoutGlobalScopes()
                ->where('time_slot_id', $timeSlot->id)
                ->whereNotIn('status', ['cancelled'])
                ->count();

            if ($booked >= $timeSlot->capacity) {
                throw ValidationException::withMessages([
                    'time_slot_id' => ['This time slot is fully booked. Please choose another.'],
                ]);
            }

            $pricing = $this->pricing->priceLines($data['items']);

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address->id,
                'time_slot_id' => $timeSlot->id,
                'status' => OrderStatus::Pending,
                'subtotal' => $pricing['subtotal'],
                'discount' => 0,
                'delivery_fee' => $pricing['delivery_fee'],
                'vat' => $pricing['vat'],
                'total' => $pricing['total'],
                'note' => $data['note'] ?? null,
            ]);

            foreach ($pricing['items'] as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'service_id' => $line['service_id'],
                    'qty' => $line['qty'],
                    'unit_price' => $line['unit_price'],
                    'line_total' => $line['line_total'],
                ]);
            }

            StatusHistory::create([
                'order_id' => $order->id,
                'status' => OrderStatus::Pending->value,
                'note' => null,
                'changed_by' => $user->id,
            ]);

            return $order;
        });

        $this->notifier->notify($order, OrderStatus::Pending);

        return new OrderResource($order->load(['address.serviceArea', 'timeSlot', 'items.service']));
    }

    public function cancel(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        if (! in_array($order->status, self::CUSTOMER_CANCELLABLE_STATUSES, true)) {
            return response()->json([
                'message' => 'This order can only be cancelled before pickup.',
            ], 422);
        }

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $order = $this->machine->transition(
            $order,
            OrderStatus::Cancelled,
            $request->user(),
            $data['reason'] ?? 'Cancelled by customer'
        );

        return new OrderResource($order);
    }

    public function invoice(Order $order)
    {
        $this->authorize('view', $order);

        $invoice = $order->invoice;

        if (! $invoice) {
            return response()->json(['message' => 'Invoice not yet available.'], 404);
        }

        return new InvoiceResource($invoice);
    }
}
