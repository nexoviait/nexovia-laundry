<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\StatusHistory;
use App\Models\TimeSlot;
use App\Services\Booking\ServiceAreaGate;
use App\Services\Notifications\OrderStatusNotifier;
use App\Services\Order\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerWebBookingController extends Controller
{
    public function __construct(
        private readonly ServiceAreaGate $areaGate,
        private readonly PricingService $pricing,
        private readonly OrderStatusNotifier $notifier,
    ) {}

    public function create(Request $request)
    {
        $user = $request->user();

        $reorderItems = [];
        if ($request->has('reorder_id')) {
            $prevOrder = Order::query()->withoutGlobalScopes()
                ->where('user_id', $user->id)
                ->find($request->input('reorder_id'));
            if ($prevOrder) {
                $reorderItems = $prevOrder->items()->get(['service_id', 'qty'])->toArray();
            }
        }

        return Inertia::render('Customer/Book', [
            'services' => Service::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'unit', 'price']),
            'addresses' => $user->addresses()->with('serviceArea')->latest()->get(),
            'timeSlots' => TimeSlot::query()
                ->where('date', '>=', now()->toDateString())
                ->orderBy('date')->orderBy('window')
                ->get(['id', 'service_area_id', 'date', 'window', 'capacity']),
            'reorderItems' => $reorderItems,
        ]);
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

        // Scope validation to user addresses
        $address = $user->addresses()->findOrFail($data['address_id']);

        $this->areaGate->assertAddressInActiveArea($address, $user, 'Blocked at web checkout');

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

            $pricing = $this->pricing->priceLines($data['items'], $address->id);

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

        return redirect()->route('orders.show', $order->id)->with('success', 'Order booked successfully!');
    }

    public function estimate(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
        ]);

        $estimate = $this->pricing->priceLines($data['items']);

        return response()->json($estimate);
    }
}
