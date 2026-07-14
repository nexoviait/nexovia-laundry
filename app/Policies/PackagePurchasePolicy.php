<?php

namespace App\Policies;

use App\Models\PackagePurchase;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class PackagePurchasePolicy
{
    use AuthorizesCustomerOwnership;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PackagePurchase $packagePurchase): bool
    {
        return $this->ownsDirectly($user, $packagePurchase);
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer' || $this->isStaff($user);
    }
}
