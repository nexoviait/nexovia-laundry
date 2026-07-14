<?php

namespace App\Enums;

/**
 * Order-level states from SRS §4. The forward path is:
 * pending -> confirmed -> assigned -> picked_up -> processing -> ready ->
 * out_for_delivery -> delivered -> rated (terminal).
 * `cancelled` is reachable from pending/confirmed/assigned/picked_up only
 * (see §4.2 note on manual admin override once processing has started).
 *
 * `on_hold` is a facility-floor extension beyond §4 (FR-OPS-004): flagging
 * an issue on any garment tag during processing pauses the whole order;
 * shop staff resolving the issue resumes it back to `processing`.
 */
enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Assigned = 'assigned';
    case PickedUp = 'picked_up';
    case Processing = 'processing';
    case OnHold = 'on_hold';
    case Ready = 'ready';
    case OutForDelivery = 'out_for_delivery';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Rated = 'rated';

    /**
     * Text from the §4.1 "Customer sees" column. Null where no customer-
     * facing copy is defined (`rated`, the customer's own action).
     */
    public function customerMessage(): ?string
    {
        return match ($this) {
            self::Pending => 'Order received, awaiting confirmation',
            self::Confirmed => 'Order confirmed',
            self::Assigned => 'Driver assigned',
            self::PickedUp => 'Items collected',
            self::Processing => 'In progress: washing/drying/ironing',
            self::OnHold => 'We found an issue with your order and are looking into it',
            self::Ready => 'Ready — invoice sent',
            self::OutForDelivery => 'Out for delivery',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Order cancelled',
            self::Rated => null,
        };
    }

    public function isTerminal(): bool
    {
        return $this === self::Cancelled || $this === self::Rated;
    }
}
