<?php

namespace App\Policies;

use App\Models\Rating;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class RatingPolicy
{
    use AuthorizesCustomerOwnership;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Rating $rating): bool
    {
        return $this->ownsDirectly($user, $rating);
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer';
    }

    public function update(User $user, Rating $rating): bool
    {
        return $this->ownsDirectly($user, $rating);
    }
}
