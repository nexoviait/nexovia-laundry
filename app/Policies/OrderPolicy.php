<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class OrderPolicy
{
    use AuthorizesCustomerOwnership;

    /** Driver and shop staff need visibility across orders to do their jobs. */
    protected function staffRoles(): array
    {
        return ['admin', 'driver', 'shop'];
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        return $this->ownsDirectly($user, $order);
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer' || $user->role === 'admin';
    }

    public function update(User $user, Order $order): bool
    {
        // Customers may only touch their own orders (e.g. cancel); staff manage all.
        return $this->isStaff($user) || (int) $order->user_id === (int) $user->id;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}
