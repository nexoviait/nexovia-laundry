<?php

namespace App\Exceptions;

use App\Enums\OrderStatus;
use RuntimeException;

class InvalidOrderTransitionException extends RuntimeException
{
    public static function notAllowed(OrderStatus $from, OrderStatus $to): self
    {
        return new self("Cannot transition order from [{$from->value}] to [{$to->value}].");
    }

    public static function notReady(OrderStatus $from): self
    {
        return new self("Cannot transition order from [{$from->value}] to [ready]: not every garment tag has reached quality_check.");
    }

    public static function overrideNotApplicable(OrderStatus $from): self
    {
        return new self("Cannot cancel order from [{$from->value}] via admin override.");
    }
}
