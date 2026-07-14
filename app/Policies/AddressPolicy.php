<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class AddressPolicy
{
    use AuthorizesCustomerOwnership;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Address $address): bool
    {
        return $this->ownsDirectly($user, $address);
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer' || $this->isStaff($user);
    }

    public function update(User $user, Address $address): bool
    {
        return $this->ownsDirectly($user, $address);
    }

    public function delete(User $user, Address $address): bool
    {
        return $this->ownsDirectly($user, $address);
    }
}
