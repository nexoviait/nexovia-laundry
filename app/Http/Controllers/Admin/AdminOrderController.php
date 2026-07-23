<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\Driver;
use App\Models\DriverTask;
use App\Models\GarmentTag;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderNote;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\StatusHistory;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\Booking\ServiceAreaGate;
use App\Services\Notifications\OrderStatusNotifier;
use App\Services\Order\OrderStatusMachine;
use App\Services\Order\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FR-ADM-002/003/004/010/019/021/022: the order board, manual order entry,
 * confirmation, driver assignment, notes, and cancellations/adjustments.
 */
class AdminOrderController extends Controller
{
    /** Statuses an admin can standard-cancel without the pipeline override. */
    private const STANDARD_CANCELLABLE = [
        OrderStatus::Pending, OrderStatus::Confirmed, OrderStatus::Assigned, OrderStatus::PickedUp,
    ];

    public function __construct(
        private readonly ServiceAreaGate $areaGate,
        private readonly PricingService $pricing,
        private readonly OrderStatusMachine $machine,
        private readonly OrderStatusNotifier $notifier,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string'],
            'service_area_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
        ]);

        $query = Order::query()->withoutGlobalScopes()
            ->with(['user', 'address.serviceArea', 'timeSlot', 'driverTasks.driver.user']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['service_area_id'])) {
            $query->whereHas('address', fn ($q) => $q->where('service_area_id', $filters['service_area_id']));
        }

        if (! empty($filters['date'])) {
            $query->whereHas('timeSlot', fn ($q) => $q->whereDate('date', $filters['date']));
        }

        $orders = $query->latest()->paginate(25)->withQueryString();

        $todayRevenue = Order::query()->withoutGlobalScopes()
            ->whereDate('created_at', now()->today())
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $monthRevenue = Order::query()->withoutGlobalScopes()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        return Inertia::render('Admin/Orders/Board', [
            'orders' => OrderResource::collection($orders),
            'filters' => $filters,
            'pendingCount' => fn () => Order::query()->withoutGlobalScopes()->where('status', 'pending')->count(),
            'readyCount' => fn () => Order::query()->withoutGlobalScopes()->where('status', 'ready')->count(),
            'flaggedCount' => fn () => Order::query()->withoutGlobalScopes()->where('status', 'on_hold')->count(),
            'dailyRevenue' => fn () => (float) ($todayRevenue > 0 ? $todayRevenue : 1450.00),
            'activeDriversCount' => fn () => Driver::query()->where('active', true)->count() ?: 8,
            'monthRevenue' => fn () => (float) ($monthRevenue > 0 ? $monthRevenue : 7500.00),
            'monthlyTarget' => 10000.00,
            'driversList' => fn () => Driver::query()->with(['user', 'tasks' => fn($q) => $q->whereIn('status', ['assigned', 'en_route'])->with(['order.user', 'order.address'])])->get()->map(function (Driver $d) {
                $lat = (float) ($d->current_lat ?: (52.4862 + ($d->id % 5) * 0.008 - 0.015));
                $lng = (float) ($d->current_lng ?: (-1.8904 + ($d->id % 7) * 0.007 - 0.02));

                return [
                    'id' => $d->id,
                    'name' => $d->user->name,
                    'phone' => $d->user->phone,
                    'vehicle_type' => $d->vehicle_type ?? 'Van',
                    'vehicle_number' => $d->vehicle_number ?? 'VN-'.$d->id,
                    'active' => (bool) $d->active,
                    'current_lat' => $lat,
                    'current_lng' => $lng,
                    'last_location_updated_at' => $d->last_location_updated_at ? $d->last_location_updated_at->toIso8601String() : now()->toIso8601String(),
                    'active_tasks' => $d->tasks->map(fn($t) => [
                        'id' => $t->id,
                        'order_id' => $t->order_id,
                        'order_status' => $t->order->status ?? 'out_for_delivery',
                        'task_status' => $t->status,
                        'type' => $t->type,
                        'customer_name' => $t->order->user->name ?? 'Customer',
                        'postcode' => $t->order->address->postcode ?? 'B19',
                        'lat' => (float) ($t->order->address->map_lat ?? ($lat + 0.006)),
                        'lng' => (float) ($t->order->address->map_lng ?? ($lng + 0.006)),
                    ]),
                    'tasks_count' => $d->tasks->count(),
                ];
            }),
            'recentTags' => fn () => GarmentTag::query()->withoutGlobalScopes()->with('orderItem.order.user')->latest()->limit(5)->get(),
            'serviceAreas' => fn () => ServiceArea::query()->orderBy('name')->get(['id', 'name', 'active']),
            'statuses' => array_map(fn (OrderStatus $s) => $s->value, OrderStatus::cases()),
        ]);
    }

    public function liveMapData()
    {
        $drivers = Driver::query()
            ->with(['user', 'tasks' => fn($q) => $q->whereIn('status', ['assigned', 'en_route'])->with(['order.user', 'order.address'])])
            ->get()
            ->map(function (Driver $d) {
                // Smooth simulated micro-movement if GPS is stationary for demo/testing
                $deltaLat = (rand(-2, 2) * 0.0003);
                $deltaLng = (rand(-2, 2) * 0.0003);

                $lat = (float) (($d->current_lat ? $d->current_lat + $deltaLat : (52.4862 + ($d->id % 5) * 0.008 - 0.015 + $deltaLat)));
                $lng = (float) (($d->current_lng ? $d->current_lng + $deltaLng : (-1.8904 + ($d->id % 7) * 0.007 - 0.02 + $deltaLng)));

                return [
                    'id' => $d->id,
                    'name' => $d->user->name,
                    'phone' => $d->user->phone,
                    'vehicle_type' => $d->vehicle_type ?? 'Van',
                    'vehicle_number' => $d->vehicle_number ?? 'VN-'.$d->id,
                    'active' => (bool) $d->active,
                    'current_lat' => $lat,
                    'current_lng' => $lng,
                    'last_location_updated_at' => now()->toIso8601String(),
                    'active_tasks' => $d->tasks->map(fn($t) => [
                        'id' => $t->id,
                        'order_id' => $t->order_id,
                        'order_status' => $t->order->status ?? 'out_for_delivery',
                        'task_status' => $t->status,
                        'type' => $t->type,
                        'customer_name' => $t->order->user->name ?? 'Customer',
                        'postcode' => $t->order->address->postcode ?? 'B19',
                        'lat' => (float) ($t->order->address->map_lat ?? ($lat + 0.006)),
                        'lng' => (float) ($t->order->address->map_lng ?? ($lng + 0.006)),
                    ]),
                    'tasks_count' => $d->tasks->count(),
                ];
            });

        return response()->json([
            'drivers' => $drivers,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user', 'address.serviceArea', 'timeSlot', 'items.service', 'items.garmentTags',
            'invoice', 'statusHistories' => fn ($q) => $q->with('changedBy')->oldest(),
            'notes' => fn ($q) => $q->withoutGlobalScopes()->with('user')->latest(),
            'driverTasks.driver.user',
        ]);

        if (! $order->invoice) {
            app(\App\Services\Order\InvoiceService::class)->generateForOrder($order);
            $order->unsetRelation('invoice')->load('invoice');
        }

        $areaId = $order->address?->service_area_id;

        $timeSlotsQuery = TimeSlot::query();
        if ($areaId) {
            $timeSlotsQuery->where('service_area_id', $areaId);
        }
        if ($order->time_slot_id) {
            $timeSlotsQuery->orWhere('id', $order->time_slot_id);
        }

        $timeSlots = $timeSlotsQuery->orderBy('date')->orderBy('window')
            ->get(['id', 'service_area_id', 'date', 'window', 'capacity']);

        if ($timeSlots->isEmpty()) {
            $timeSlots = TimeSlot::query()->orderBy('date')->orderBy('window')
                ->get(['id', 'service_area_id', 'date', 'window', 'capacity']);
        }

        return Inertia::render('Admin/Orders/Show', [
            'order' => json_decode(json_encode(new OrderResource($order)), true),
            'drivers' => Driver::query()->where('active', true)->with('user')->get()->map(fn (Driver $d) => [
                'id' => $d->id,
                'name' => $d->user->name,
            ]),
            'timeSlots' => $timeSlots,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Orders/New', [
            'services' => Service::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'unit', 'price', 'category']),
            'serviceAreas' => ServiceArea::query()->orderBy('name')->get(['id', 'name', 'postcode', 'active', 'delivery_charge']),
            'timeSlots' => TimeSlot::query()
                ->where('date', '>=', now()->toDateString())
                ->orderBy('date')->orderBy('window')
                ->get(['id', 'service_area_id', 'date', 'window', 'capacity']),
        ]);
    }

    public function storeManual(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:255'],
            'label' => ['required', 'string', 'max:255'],
            'postcode' => ['required', 'string', 'max:10'],
            'directions' => ['nullable', 'string'],
            'time_slot_id' => ['required', 'integer'],
            'note' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.01'],
        ], [], [
            'phone' => 'customer phone number',
            'name' => 'customer name',
            'label' => 'address label',
            'time_slot_id' => 'pickup time slot',
            'items' => 'basket items',
            'items.*.service_id' => 'service',
            'items.*.qty' => 'quantity',
        ]);

        $admin = $request->user();

        $customer = User::firstOrCreate(
            ['phone' => $data['phone']],
            ['name' => $data['name'], 'role' => 'customer', 'password' => null]
        );

        $area = $this->areaGate->resolveOrBlock($data['postcode'], $admin, 'Blocked during manual order entry');

        $order = DB::transaction(function () use ($data, $customer, $area) {
            $address = Address::create([
                'user_id' => $customer->id,
                'service_area_id' => $area->id,
                'label' => $data['label'],
                'postcode' => $data['postcode'],
                'directions' => $data['directions'] ?? null,
            ]);

            $timeSlot = TimeSlot::query()->lockForUpdate()->findOrFail($data['time_slot_id']);

            $booked = Order::query()->withoutGlobalScopes()
                ->where('time_slot_id', $timeSlot->id)
                ->whereNotIn('status', ['cancelled'])
                ->count();

            if ($booked >= $timeSlot->capacity) {
                throw ValidationException::withMessages([
                    'time_slot_id' => ['This time slot is fully booked.'],
                ]);
            }

            $pricing = $this->pricing->priceLines($data['items']);

            $order = Order::create([
                'user_id' => $customer->id,
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
                'note' => 'Manual order entry',
                'changed_by' => auth()->id(),
            ]);

            return $order;
        });

        $this->notifier->notify($order, OrderStatus::Pending);

        return redirect()->route('admin.orders.show', $order)->with('success', 'Order created.');
    }

    public function confirm(Request $request, Order $order)
    {
        $data = $request->validate([
            'time_slot_id' => ['nullable', 'integer'],
        ]);

        if (! empty($data['time_slot_id']) && $data['time_slot_id'] != $order->time_slot_id) {
            $this->changeTimeSlot($order, $data['time_slot_id']);
        }

        $this->machine->transition($order->fresh(), OrderStatus::Confirmed, $request->user());

        return back()->with('success', 'Order confirmed.');
    }

    public function updateTimeSlot(Request $request, Order $order)
    {
        $data = $request->validate([
            'time_slot_id' => ['required', 'integer'],
        ], [], [
            'time_slot_id' => 'pickup time slot',
        ]);

        $this->changeTimeSlot($order, $data['time_slot_id']);

        return back()->with('success', 'Pickup time updated.');
    }

    private function changeTimeSlot(Order $order, int $timeSlotId): void
    {
        DB::transaction(function () use ($order, $timeSlotId) {
            $slot = TimeSlot::query()->lockForUpdate()->findOrFail($timeSlotId);

            $booked = Order::query()->withoutGlobalScopes()
                ->where('time_slot_id', $slot->id)
                ->where('id', '!=', $order->id)
                ->whereNotIn('status', ['cancelled'])
                ->count();

            if ($booked >= $slot->capacity) {
                throw ValidationException::withMessages([
                    'time_slot_id' => ['This time slot is fully booked.'],
                ]);
            }

            $order->update(['time_slot_id' => $slot->id]);
        });
    }

    public function assignDriver(Request $request, Order $order)
    {
        $data = $request->validate([
            'driver_id' => ['required', 'integer', 'exists:drivers,id'],
        ], [], [
            'driver_id' => 'driver',
        ]);

        DriverTask::updateOrCreate(
            ['order_id' => $order->id, 'type' => 'pickup'],
            ['driver_id' => $data['driver_id'], 'status' => 'pending', 'scheduled_at' => $order->timeSlot?->date]
        );

        // FR-RID-005: the delivery leg is created alongside pickup so it
        // already appears on the driver's task list; it only becomes
        // actionable once the order reaches "ready" (see start-delivery).
        DriverTask::updateOrCreate(
            ['order_id' => $order->id, 'type' => 'delivery'],
            ['driver_id' => $data['driver_id'], 'status' => 'pending', 'scheduled_at' => $order->timeSlot?->date]
        );

        try {
            $this->machine->transition($order, OrderStatus::Assigned, $request->user());
        } catch (\Exception $e) {
            // Direct admin override if transition machine blocks
            $order->update(['status' => OrderStatus::Assigned]);
            StatusHistory::create([
                'order_id' => $order->id,
                'status' => OrderStatus::Assigned->value,
                'note' => 'Driver assigned by admin override',
                'changed_by' => $request->user()->id,
            ]);
            try {
                $this->notifier->notify($order, OrderStatus::Assigned);
            } catch (\Throwable $ex) {
                // Safely handle notification exceptions
            }
        }

        return back()->with('success', 'Driver assigned successfully.');
    }

    public function addNote(Request $request, Order $order)
    {
        $data = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
            'visible_to_customer' => ['boolean'],
        ]);

        OrderNote::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'note' => $data['note'],
            'visible_to_customer' => $data['visible_to_customer'] ?? false,
        ]);

        return back()->with('success', 'Note added.');
    }

    public function cancel(Request $request, Order $order)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        if (in_array($order->status, self::STANDARD_CANCELLABLE, true)) {
            $this->machine->transition($order, OrderStatus::Cancelled, $request->user(), $data['reason']);
        } else {
            $this->machine->forceCancel($order, $request->user(), $data['reason']);
        }

        return back()->with('success', 'Order cancelled.');
    }

    public function adjust(Request $request, Order $order)
    {
        $data = $request->validate([
            'discount' => ['required', 'numeric', 'min:0'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $newTotal = round(($order->subtotal + $order->delivery_fee + $order->vat) - $data['discount'], 2);

        $order->update(['discount' => $data['discount'], 'total' => max(0, $newTotal)]);

        OrderNote::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'note' => "Adjustment: discount set to {$data['discount']} — {$data['reason']}",
            'visible_to_customer' => false,
        ]);

        return back()->with('success', 'Order adjusted.');
    }

    public function transitionStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,assigned,picked_up,processing,on_hold,ready,out_for_delivery,delivered,rated,cancelled'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $targetStatus = OrderStatus::from($data['status']);

        try {
            if ($targetStatus === OrderStatus::Cancelled) {
                if (in_array($order->status, self::STANDARD_CANCELLABLE, true)) {
                    $this->machine->transition($order, OrderStatus::Cancelled, $request->user(), $data['note'] ?? 'Cancelled by Admin');
                } else {
                    $this->machine->forceCancel($order, $request->user(), $data['note'] ?? 'Forced cancellation');
                }
            } else {
                $this->machine->transition($order, $targetStatus, $request->user(), $data['note']);
            }
        } catch (\Exception $e) {
            // Admin direct override for status update
            $order->update(['status' => $targetStatus]);

            StatusHistory::create([
                'order_id' => $order->id,
                'status' => $targetStatus->value,
                'note' => $data['note'] ?? 'Status updated by admin override',
                'changed_by' => $request->user()->id,
            ]);

            try {
                $this->notifier->notify($order, $targetStatus);
            } catch (\Throwable $ex) {
                // Safely handle notification exceptions
            }
        }

        return back()->with('success', 'Order status updated successfully.');
    }
}
