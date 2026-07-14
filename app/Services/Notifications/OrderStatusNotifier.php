<?php

namespace App\Services\Notifications;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\UserNotification;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;

/**
 * Fires customer notifications per SRS §4.1's "Customer sees" column on
 * every order status change: in-app (REQ-CUST-05), SMS (REQ-CUST-06), and
 * push, via pluggable gateways (console/log stubs for now).
 */
class OrderStatusNotifier
{
    public function __construct(
        private readonly SmsGateway $sms,
        private readonly PushGateway $push,
    ) {}

    public function notify(Order $order, OrderStatus $status): void
    {
        $message = $status->customerMessage();

        if ($message === null) {
            return;
        }

        $user = $order->user;

        UserNotification::create([
            'user_id' => $user->id,
            'title' => "Order #{$order->id} update",
            'body' => $message,
            'type' => 'order_update',
        ]);

        if ($user->phone) {
            $this->sms->send($user->phone, $message);
        }

        $this->push->send($user, $message);
    }
}
