<?php

namespace App\Policies;

use App\Models\DriverTask;
use App\Models\User;

class DriverTaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DriverTask $driverTask): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'driver') {
            return $driverTask->driver && (int) $driverTask->driver->user_id === (int) $user->id;
        }

        if ($user->role === 'customer') {
            return $driverTask->order && (int) $driverTask->order->user_id === (int) $user->id;
        }

        return false;
    }

    public function update(User $user, DriverTask $driverTask): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'driver'
            && $driverTask->driver
            && (int) $driverTask->driver->user_id === (int) $user->id;
    }
}
