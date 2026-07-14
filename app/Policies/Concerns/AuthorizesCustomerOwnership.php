<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared authorization rules backing NFR-013 (per-customer data isolation)
 * at the policy layer, in addition to the query-level global scopes.
 */
trait AuthorizesCustomerOwnership
{
    /**
     * Roles that may act on any record of this resource regardless of ownership.
     *
     * @return array<int, string>
     */
    protected function staffRoles(): array
    {
        return ['admin'];
    }

    protected function isStaff(User $user): bool
    {
        return in_array($user->role, $this->staffRoles(), true);
    }

    protected function ownsDirectly(User $user, Model $model, string $column = 'user_id'): bool
    {
        return $this->isStaff($user) || (int) $model->getAttribute($column) === (int) $user->id;
    }

    protected function ownsThroughOrder(User $user, Model $model, string $relation = 'order'): bool
    {
        if ($this->isStaff($user)) {
            return true;
        }

        $order = data_get($model, $relation);

        return $order && (int) $order->user_id === (int) $user->id;
    }
}
