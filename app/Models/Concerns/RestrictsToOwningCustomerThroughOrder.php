<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

/**
 * Global query scope enforcing per-customer data isolation (NFR-013)
 * for models that don't carry `user_id` directly but hang off an
 * `Order` (e.g. OrderItem, Invoice, StatusHistory, GarmentTag via
 * orderItem.order). A logged-in customer only sees rows whose related
 * order belongs to them; staff roles are unaffected.
 */
trait RestrictsToOwningCustomerThroughOrder
{
    public static function bootRestrictsToOwningCustomerThroughOrder(): void
    {
        static::addGlobalScope('customer_isolation', function (Builder $builder) {
            $user = Auth::user();

            if (! $user || $user->role !== 'customer') {
                return;
            }

            $relation = property_exists(static::class, 'customerOwnerRelation')
                ? static::$customerOwnerRelation
                : 'order';

            $builder->whereHas($relation, function (Builder $query) use ($user) {
                $query->where('user_id', $user->id);
            });
        });
    }
}
