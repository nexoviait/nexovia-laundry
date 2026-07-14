<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\DriverTaskResource;
use App\Models\DriverTask;
use App\Models\Invoice;
use App\Models\OrderNote;
use App\Services\Notifications\OrderStatusNotifier;
use App\Services\Order\OrderStatusMachine;
use App\Services\Sms\SmsGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * FR-RID-002 to 008: the driver app's task list, pickup flow, delivery
 * flow (with customer OTP + cash-on-delivery), and failure reporting.
 */
class DriverTaskController extends Controller
{
    public function __construct(
        private readonly OrderStatusMachine $machine,
        private readonly OrderStatusNotifier $notifier,
        private readonly SmsGateway $sms,
    ) {
    }

    /** FR-RID-002: today's task list, sorted by pickup/delivery slot then area. */
    public function index(Request $request)
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        $tasks = DriverTask::query()
            ->where('driver_id', $driver->id)
            ->whereDate('scheduled_at', now()->toDateString())
            ->whereIn('status', ['pending', 'en_route'])
            ->with(['order.address.serviceArea', 'order.timeSlot', 'order.user', 'order.items.service'])
            ->get()
            ->sortBy([
                fn (DriverTask $a, DriverTask $b) => $a->order->timeSlot?->window <=> $b->order->timeSlot?->window,
                fn (DriverTask $a, DriverTask $b) => ($a->order->address?->serviceArea?->name ?? '') <=> ($b->order->address?->serviceArea?->name ?? ''),
            ])
            ->values();

        return DriverTaskResource::collection($tasks);
    }

    /** FR-RID-003: task detail (address/map pin surfaced via OrderResource -> AddressResource). */
    public function show(DriverTask $driverTask)
    {
        $this->authorize('view', $driverTask);

        $driverTask->load(['order.address.serviceArea', 'order.timeSlot', 'order.user', 'order.items.service']);

        return new DriverTaskResource($driverTask);
    }

    /** FR-RID-004: pickup flow — item count, weight, 1-4 photos, confirm. */
    public function pickup(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        if ($driverTask->type !== 'pickup') {
            return response()->json(['message' => 'This is not a pickup task.'], 422);
        }

        $data = $request->validate([
            'item_count' => ['required', 'integer', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'photos' => ['required', 'array', 'min:1', 'max:4'],
            'photos.*' => ['image', 'max:5120'],
        ]);

        $paths = collect($request->file('photos'))
            ->map(fn ($photo) => $photo->store('driver-tasks/pickup', 'public'))
            ->all();

        $order = $driverTask->order;

        DB::transaction(function () use ($driverTask, $data, $paths) {
            $driverTask->update([
                'item_count' => $data['item_count'],
                'weight' => $data['weight'] ?? null,
                'photos' => $paths,
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        });

        $this->machine->transition($order, OrderStatus::PickedUp, $request->user());

        return new DriverTaskResource($driverTask->fresh());
    }

    /**
     * FR-RID-005: driver starts the delivery run once the order is ready —
     * generates the customer's handover OTP and sends it by SMS.
     */
    public function startDelivery(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        if ($driverTask->type !== 'delivery') {
            return response()->json(['message' => 'This is not a delivery task.'], 422);
        }

        $order = $driverTask->order;

        if ($order->status !== OrderStatus::Ready) {
            return response()->json(['message' => 'This order is not ready for delivery yet.'], 422);
        }

        $otp = (string) random_int(1000, 9999);

        $driverTask->update(['otp' => $otp, 'otp_verified_at' => null, 'status' => 'en_route']);

        if ($order->user->phone) {
            $this->sms->send($order->user->phone, "Your Clean Quick Laundry order #{$order->id} is out for delivery. Give the driver this code to confirm handover: {$otp}");
        }

        $this->machine->transition($order, OrderStatus::OutForDelivery, $request->user());

        return new DriverTaskResource($driverTask->fresh());
    }

    /** FR-RID-006/007: delivery handover — customer OTP + cash-on-delivery recording. */
    public function deliver(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        if ($driverTask->type !== 'delivery') {
            return response()->json(['message' => 'This is not a delivery task.'], 422);
        }

        $data = $request->validate([
            'otp' => ['required', 'string'],
            'payment_method' => ['required', 'string', 'in:cash'],
            'cod_amount' => ['required_if:payment_method,cash', 'nullable', 'numeric', 'min:0'],
        ]);

        if ($driverTask->otp_verified_at !== null || $driverTask->otp === null || $driverTask->otp !== $data['otp']) {
            throw ValidationException::withMessages(['otp' => ['That code is incorrect or already used.']]);
        }

        $order = $driverTask->order;

        DB::transaction(function () use ($driverTask, $data, $order) {
            $driverTask->update([
                'otp_verified_at' => now(),
                'payment_method' => $data['payment_method'],
                'cod_amount' => $data['cod_amount'] ?? null,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            Invoice::query()->where('order_id', $order->id)->update([
                'method' => $data['payment_method'],
                'status' => 'paid',
            ]);
        });

        $this->machine->transition($order, OrderStatus::Delivered, $request->user());

        return new DriverTaskResource($driverTask->fresh());
    }

    /** FR-RID-008: failed pickup/delivery reporting with a reason. */
    public function fail(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $driverTask->update([
            'status' => 'failed',
            'failure_reason' => $data['reason'],
        ]);

        OrderNote::create([
            'order_id' => $driverTask->order_id,
            'user_id' => $request->user()->id,
            'note' => ucfirst($driverTask->type)." failed: {$data['reason']}",
            'visible_to_customer' => false,
        ]);

        return new DriverTaskResource($driverTask->fresh());
    }
}
