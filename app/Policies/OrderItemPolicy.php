<?php

namespace App\Policies;

use App\Models\OrderItem;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class OrderItemPolicy
{
    use AuthorizesCustomerOwnership;

    protected function staffRoles(): array
    {
        return ['admin', 'driver', 'shop'];
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, OrderItem $orderItem): bool
    {
        return $this->ownsThroughOrder($user, $orderItem, 'order');
    }

    public function update(User $user, OrderItem $orderItem): bool
    {
        return $this->isStaff($user);
    }

    public function delete(User $user, OrderItem $orderItem): bool
    {
        return $user->role === 'admin';
    }
}
