<?php

namespace App\Policies;

use App\Models\OrderNote;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class OrderNotePolicy
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

    public function view(User $user, OrderNote $orderNote): bool
    {
        return $this->ownsThroughOrder($user, $orderNote, 'order');
    }

    public function create(User $user): bool
    {
        return true;
    }
}
