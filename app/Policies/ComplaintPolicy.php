<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class ComplaintPolicy
{
    use AuthorizesCustomerOwnership;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Complaint $complaint): bool
    {
        return $this->ownsDirectly($user, $complaint);
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer';
    }

    public function update(User $user, Complaint $complaint): bool
    {
        return $this->isStaff($user);
    }
}
