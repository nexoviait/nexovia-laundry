<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserNotification;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class UserNotificationPolicy
{
    use AuthorizesCustomerOwnership;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, UserNotification $userNotification): bool
    {
        return $this->ownsDirectly($user, $userNotification);
    }

    public function update(User $user, UserNotification $userNotification): bool
    {
        // e.g. marking as read
        return $this->ownsDirectly($user, $userNotification);
    }
}
