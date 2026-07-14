<?php

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Models\Order;
use App\Models\StatusHistory;
use App\Models\User;
use App\Services\Notifications\OrderStatusNotifier;
use Illuminate\Support\Facades\DB;

/**
 * Enforces the order-level state machine from SRS §4: a forward-only path
 * with a cancellation window that closes once processing starts (§4.2).
 * Every transition is logged to StatusHistory with the acting user and a
 * timestamp, and fires the customer notification for the new status.
 */
class OrderStatusMachine
{
    /**
     * Standard forward-only graph, plus the cancellation window: cancel is
     * only reachable from pending/confirmed/assigned/picked_up (§4 diagram
     * + §4.2 note — not reachable once processing has started without the
     * manual admin override in forceCancel()).
     *
     * @var array<string, list<string>>
     */
    private const ALLOWED_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['assigned', 'cancelled'],
        'assigned' => ['picked_up', 'cancelled'],
        'picked_up' => ['processing', 'cancelled'],
        'processing' => ['ready', 'on_hold'],
        'on_hold' => ['processing'],
        'ready' => ['out_for_delivery'],
        'out_for_delivery' => ['delivered'],
        'delivered' => ['rated'],
        'cancelled' => [],
        'rated' => [],
    ];

    /** States "already in the pipeline" that require the admin override to cancel (§4.2). */
    private const OVERRIDE_CANCELLABLE_FROM = [
        OrderStatus::Processing,
        OrderStatus::OnHold,
        OrderStatus::Ready,
        OrderStatus::OutForDelivery,
    ];

    public function __construct(private readonly OrderStatusNotifier $notifier) {}

    public function transition(Order $order, OrderStatus $to, User $actor, ?string $note = null): Order
    {
        $from = $order->status;

        if (! in_array($to->value, self::ALLOWED_TRANSITIONS[$from->value], true)) {
            throw InvalidOrderTransitionException::notAllowed($from, $to);
        }

        if ($to === OrderStatus::Ready && ! $this->allGarmentTagsAtQualityCheck($order)) {
            throw InvalidOrderTransitionException::notReady($from);
        }

        return $this->applyTransition($order, $to, $actor, $note);
    }

    /**
     * Admin-only escape hatch for cancelling an order that's already in the
     * shop pipeline (processing/ready/out_for_delivery), per the §4.2 note
     * that this is not modeled as a standard transition.
     */
    public function forceCancel(Order $order, User $admin, string $note): Order
    {
        $from = $order->status;

        if (! in_array($from, self::OVERRIDE_CANCELLABLE_FROM, true)) {
            throw InvalidOrderTransitionException::overrideNotApplicable($from);
        }

        return $this->applyTransition($order, OrderStatus::Cancelled, $admin, $note);
    }

    private function applyTransition(Order $order, OrderStatus $to, User $actor, ?string $note): Order
    {
        DB::transaction(function () use ($order, $to, $actor, $note) {
            $order->update(['status' => $to]);

            StatusHistory::create([
                'order_id' => $order->id,
                'status' => $to->value,
                'note' => $note,
                'changed_by' => $actor->id,
            ]);
        });

        $order->refresh();

        $this->notifier->notify($order, $to);

        return $order;
    }

    private function allGarmentTagsAtQualityCheck(Order $order): bool
    {
        $tags = $order->items()->with('garmentTags')->get()->flatMap->garmentTags;

        return $tags->isNotEmpty() && $tags->every(fn ($tag) => $tag->stage === 'quality_check');
    }
}
