<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Order\OrderStatusMachine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerWebOrderController extends Controller
{
    private const CUSTOMER_CANCELLABLE_STATUSES = [
        'pending',
        'confirmed',
        'assigned',
    ];

    public function __construct(private readonly OrderStatusMachine $machine) {}

    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['address.serviceArea', 'timeSlot', 'items.service'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Customer/Dashboard', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order)
    {
        // Scope check
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $order->load([
            'address.serviceArea',
            'timeSlot',
            'items.service',
            'items.garmentTags',
            'invoice',
            'rating',
            'statusHistories' => fn ($query) => $query->with('changedBy')->oldest(),
            'driverTasks.driver.user',
        ]);

        return Inertia::render('Customer/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        if (! in_array($order->status->value, self::CUSTOMER_CANCELLABLE_STATUSES, true)) {
            return back()->with('error', 'This order can only be cancelled before pickup.');
        }

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $this->machine->transition(
            $order,
            OrderStatus::Cancelled,
            $request->user(),
            $data['reason'] ?? 'Cancelled by customer'
        );

        return back()->with('success', 'Order cancelled successfully.');
    }

    public function rate(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($order->status->value !== 'delivered') {
            return back()->with('error', 'Only delivered orders can be rated.');
        }

        $data = $request->validate([
            'stars' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        // Create the rating
        $order->rating()->create([
            'user_id' => $request->user()->id,
            'stars' => $data['stars'],
            'comment' => $data['comment'] ?? null,
        ]);

        // Transition order status to rated
        $this->machine->transition(
            $order,
            OrderStatus::Rated,
            $request->user(),
            'Rated by customer: ' . $data['stars'] . ' stars'
        );

        return back()->with('success', 'Thank you for your rating!');
    }

    public function complaint(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
        ]);

        $order->complaints()->create([
            'user_id' => $request->user()->id,
            'subject' => $data['subject'],
            'description' => $data['description'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Your issue report has been submitted. Support team will inspect shortly.');
    }
}
