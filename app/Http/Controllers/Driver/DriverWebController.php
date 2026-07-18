<?php

namespace App\Http\Controllers\Driver;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\DriverTask;
use App\Models\Invoice;
use App\Models\OrderNote;
use App\Services\Order\OrderStatusMachine;
use App\Services\Sms\SmsGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DriverWebController extends Controller
{
    public function __construct(
        private readonly OrderStatusMachine $machine,
        private readonly SmsGateway $sms,
    ) {}

    public function dashboard(Request $request): Response
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        $tasks = DriverTask::query()
            ->where('driver_id', $driver->id)
            ->whereDate('scheduled_at', now()->toDateString())
            ->with(['order.address.serviceArea', 'order.timeSlot', 'order.user', 'order.items.service'])
            ->get()
            ->sortBy([
                fn (DriverTask $a, DriverTask $b) => $a->order->timeSlot?->window <=> $b->order->timeSlot?->window,
                fn (DriverTask $a, DriverTask $b) => ($a->order->address?->serviceArea?->name ?? '') <=> ($b->order->address?->serviceArea?->name ?? ''),
            ])
            ->values();

        return Inertia::render('Driver/Dashboard', [
            'tasks'      => $tasks,
            'driver'     => $driver->load('user'),
            'today_date' => now()->toDateString(),
        ]);
    }

    public function liveQueue(Request $request): Response
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        return Inertia::render('Driver/LiveQueue', [
            'driver' => $driver->load('user'),
        ]);
    }

    public function otpHandover(Request $request): Response
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        return Inertia::render('Driver/OtpHandover', [
            'driver' => $driver->load('user'),
        ]);
    }

    public function support(Request $request): Response
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        return Inertia::render('Driver/Support', [
            'driver' => $driver->load('user'),
        ]);
    }

    public function settings(Request $request): Response
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        return Inertia::render('Driver/Settings', [
            'driver' => $driver->load('user'),
        ]);
    }

    public function toggleStatus(Request $request)
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        $driver->update(['active' => ! $driver->active]);

        return back()->with('success', $driver->active ? 'You are back online.' : 'You are now offline. New tasks will not be assigned to you.');
    }

    public function history(Request $request): Response
    {
        $driver = $request->user()->driver;

        abort_unless($driver, 403, 'This account is not linked to a driver profile.');

        $history = DriverTask::query()
            ->where('driver_id', $driver->id)
            ->whereIn('status', ['completed', 'failed'])
            ->where(function ($q) {
                $q->whereDate('scheduled_at', '<', now()->toDateString())
                  ->orWhere(function ($q2) {
                      $q2->whereDate('scheduled_at', now()->toDateString())
                         ->whereIn('status', ['completed', 'failed']);
                  });
            })
            ->with(['order.address.serviceArea', 'order.timeSlot', 'order.user'])
            ->orderByDesc('completed_at')
            ->limit(50)
            ->get();

        return Inertia::render('Driver/History', [
            'history' => $history,
            'driver'  => $driver->load('user'),
        ]);
    }

    public function showTask(DriverTask $driverTask): Response
    {
        $this->authorize('view', $driverTask);

        $driverTask->load(['order.address.serviceArea', 'order.timeSlot', 'order.user', 'order.items.service', 'order.invoice', 'driver.user']);

        $driver = request()->user()->driver?->load('user');

        return Inertia::render('Driver/TaskShow', [
            'task'   => $driverTask,
            'driver' => $driver,
        ]);
    }

    public function pickup(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        if ($driverTask->type !== 'pickup') {
            return back()->with('error', 'This is not a pickup task.');
        }

        $data = $request->validate([
            'item_count' => ['required', 'integer', 'min:0'],
            'weight'     => ['nullable', 'numeric', 'min:0'],
            'photos'     => ['required', 'array', 'min:1', 'max:4'],
            'photos.*'   => ['image', 'max:5120'],
        ]);

        $paths = collect($request->file('photos'))
            ->map(fn ($photo) => $photo->store('driver-tasks/pickup', 'public'))
            ->all();

        $order = $driverTask->order;

        DB::transaction(function () use ($driverTask, $data, $paths) {
            $driverTask->update([
                'item_count'   => $data['item_count'],
                'weight'       => $data['weight'] ?? null,
                'photos'       => $paths,
                'status'       => 'completed',
                'completed_at' => now(),
            ]);
        });

        $this->machine->transition($order, OrderStatus::PickedUp, $request->user());

        return redirect()->route('driver.dashboard')->with('success', 'Pickup confirmed! Order is now at the facility.');
    }

    public function startDelivery(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        if ($driverTask->type !== 'delivery') {
            return back()->with('error', 'This is not a delivery task.');
        }

        $order = $driverTask->order;

        if ($order->status !== OrderStatus::Ready) {
            return back()->with('error', 'This order is not ready for delivery yet.');
        }

        $otp = (string) random_int(1000, 9999);

        $driverTask->update(['otp' => $otp, 'otp_verified_at' => null, 'status' => 'en_route']);

        if ($order->user->phone) {
            $this->sms->send($order->user->phone, "Your Clean Quick Laundry order #{$order->id} is out for delivery. Give the driver this code to confirm handover: {$otp}");
        }

        $this->machine->transition($order, OrderStatus::OutForDelivery, $request->user());

        return back()->with('success', 'Delivery started! OTP has been sent to the customer.');
    }

    public function deliver(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        if ($driverTask->type !== 'delivery') {
            return back()->with('error', 'This is not a delivery task.');
        }

        $data = $request->validate([
            'otp'            => ['required', 'string'],
            'payment_method' => ['required', 'string', 'in:cash'],
            'cod_amount'     => ['required_if:payment_method,cash', 'nullable', 'numeric', 'min:0'],
        ]);

        if ($driverTask->otp_verified_at !== null || $driverTask->otp === null || $driverTask->otp !== $data['otp']) {
            throw ValidationException::withMessages(['otp' => ['That code is incorrect or already used.']]);
        }

        $order = $driverTask->order;

        DB::transaction(function () use ($driverTask, $data, $order) {
            $driverTask->update([
                'otp_verified_at' => now(),
                'payment_method'  => $data['payment_method'],
                'cod_amount'      => $data['cod_amount'] ?? null,
                'status'          => 'completed',
                'completed_at'    => now(),
            ]);

            Invoice::query()->where('order_id', $order->id)->update([
                'method' => $data['payment_method'],
                'status' => 'paid',
            ]);
        });

        $this->machine->transition($order, OrderStatus::Delivered, $request->user());

        return redirect()->route('driver.dashboard')->with('success', 'Delivery completed! Payment recorded.');
    }

    public function fail(Request $request, DriverTask $driverTask)
    {
        $this->authorize('update', $driverTask);

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $driverTask->update([
            'status'         => 'failed',
            'failure_reason' => $data['reason'],
            'completed_at'   => now(),
        ]);

        OrderNote::create([
            'order_id'            => $driverTask->order_id,
            'user_id'             => $request->user()->id,
            'note'                => ucfirst($driverTask->type) . " failed: {$data['reason']}",
            'visible_to_customer' => false,
        ]);

        return redirect()->route('driver.dashboard')->with('error', 'Task marked as failed. Admin has been notified.');
    }
}
