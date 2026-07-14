<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

/**
 * Global query scope enforcing per-customer data isolation (NFR-013):
 * a logged-in customer only ever sees rows whose owner column matches
 * their own user id. Staff roles (admin/driver/shop) are unaffected.
 *
 * Apply to models that carry the owner id directly on their own row
 * (e.g. `user_id`). For models that only reach their owner through an
 * `Order` relationship, use RestrictsToOwningCustomerThroughOrder instead.
 */
trait RestrictsToOwningCustomer
{
    public static function bootRestrictsToOwningCustomer(): void
    {
        static::addGlobalScope('customer_isolation', function (Builder $builder) {
            $user = Auth::user();

            if (! $user || $user->role !== 'customer') {
                return;
            }

            $column = property_exists(static::class, 'customerOwnerColumn')
                ? static::$customerOwnerColumn
                : 'user_id';

            $builder->where($builder->getModel()->qualifyColumn($column), $user->id);
        });
    }
}
