<?php

namespace App\Policies;

use App\Models\GarmentTag;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class GarmentTagPolicy
{
    use AuthorizesCustomerOwnership;

    protected function staffRoles(): array
    {
        return ['admin', 'shop'];
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GarmentTag $garmentTag): bool
    {
        return $this->ownsThroughOrder($user, $garmentTag, 'orderItem.order');
    }

    public function update(User $user, GarmentTag $garmentTag): bool
    {
        return $this->isStaff($user);
    }
}
