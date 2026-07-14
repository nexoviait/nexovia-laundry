<?php

namespace App\Policies;

use App\Models\StatusHistory;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class StatusHistoryPolicy
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

    public function view(User $user, StatusHistory $statusHistory): bool
    {
        return $this->ownsThroughOrder($user, $statusHistory, 'order');
    }

    public function create(User $user): bool
    {
        return $this->isStaff($user);
    }
}
